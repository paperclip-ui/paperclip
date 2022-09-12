use super::config::{CompilerOptions, Config};
use anyhow::Result;
use paperclip_evaluator::css::evaluator::evaluate as evaluate_css;
use paperclip_evaluator::css::serializer::serialize as serialize_css;
use paperclip_evaluator::html::evaluator::{evaluate as evaluate_html, Options as HTMLOptions};
use paperclip_evaluator::html::serializer::serialize as serialize_html;
use paperclip_parser::graph::graph::Graph;
use path_absolutize::*;
use std::cell::RefCell;
#[macro_use]
use paperclip_common::{join_path, get_or_short};
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::path::Path;
use std::rc::Rc;
use textwrap::indent;

pub struct TargetCompiler {
    options: CompilerOptions,
    project_dir: String,
    all_compiled_css: RefCell<BTreeMap<String, String>>,
    config: Config,
}

struct TranslateOptions {
    global_imports: Vec<String>,
}

impl<'options> TargetCompiler {
    // TODO: load bin
    pub fn load(options: CompilerOptions, config: Config, project_dir: String) -> Self {
        Self {
            options,
            config,
            all_compiled_css: RefCell::new(BTreeMap::new()),
            project_dir,
        }
    }

    pub async fn compile_graph(&self, graph: &Graph) -> Result<BTreeMap<String, String>> {
        let mut all_files: BTreeMap<String, String> = BTreeMap::new();
        for (path, _) in &graph.dependencies {
            let files = self.compile_dependency(path, &graph).await?;
            for (file_path, content) in files {
                if self.options.main_css_file_name != None && file_path.contains(".css") {
                    self.all_compiled_css
                        .borrow_mut()
                        .insert(file_path.to_string(), content.to_string());
                } else {
                    all_files.insert(file_path.to_string(), content.to_string());
                }
            }
        }

        if let Some(main_css_file_path) = &self.get_main_css_file_path() {
            all_files.insert(
                main_css_file_path.to_string(),
                self.all_compiled_css
                    .borrow()
                    .iter()
                    .map(|(key, content)| format!("/* {} */\n{}", key, content))
                    .collect::<Vec<String>>()
                    .join("\n\n"),
            );
        }

        Ok(all_files)
    }

    async fn compile_dependency(
        &self,
        path: &str,
        graph: &Graph,
    ) -> Result<HashMap<String, String>> {
        let data = self.translate_with_options(path, graph).await?;

        let mut files = HashMap::new();
        let out_file = &self.resolve_out_file(path);

        for (ext, content) in data {
            let compiled_file = format!("{}.{}", out_file, ext);
            files.insert(compiled_file, content);
        }

        Ok(files)
    }

    async fn translate_with_options(
        &self,
        path: &str,
        graph: &Graph,
    ) -> Result<HashMap<String, String>> {
        let mut data = HashMap::new();

        let resolve_asset = Rc::new(Box::new(|v: &str| v.to_string()));

        if let Some(emit) = &self.options.emit {
            for ext in emit {
                if let Some(code) = translate(
                    ext,
                    path,
                    graph,
                    resolve_asset.clone(),
                    self.get_ext_translate_options(ext, path, graph),
                )
                .await?
                {
                    data.insert(ext.to_string(), code);
                }
            }
        }

        Ok(data)
    }

    fn get_ext_translate_options(&self, ext: &str, path: &str, graph: &Graph) -> TranslateOptions {
        TranslateOptions {
            global_imports: if ext == "css" {
                vec![]
            } else {
                let mut imports = vec![];

                if let Some(main_css_path) = &self.get_main_css_file_path() {
                    imports.push(format!("{}", main_css_path));
                } else {
                    imports.push(format!("{}.css", path));

                    imports.extend(
                        graph
                            .dependencies
                            .get(path)
                            .and_then(|dep| {
                                Some(
                                    dep.imports
                                        .values()
                                        .map(|import_path| format!("{}.css", import_path))
                                        .collect::<Vec<String>>(),
                                )
                            })
                            .unwrap_or(vec![]),
                    )
                };

                imports
            },
        }
    }

    fn get_main_css_file_path(&self) -> Option<String> {
        let main_css_file_name = get_or_short!(&self.options.main_css_file_name, None);
        let asset_out_dir = get_or_short!(&self.options.asset_out_dir, None);

        Some(join_path!(
            &self.get_out_dir_path(),
            asset_out_dir.clone(),
            main_css_file_name.clone()
        ))
    }

    fn get_out_dir_path(&self) -> String {
        if let Some(out_dir) = &self.options.out_dir {
            join_path!(&self.project_dir, out_dir.to_string())
        } else {
            self.get_src_dir_path()
        }
    }

    fn get_src_dir_path(&self) -> String {
        join_path!(
            &self.project_dir,
            if let Some(src_dir) = &self.config.src_dir {
                src_dir.to_string()
            } else {
                ".".to_string()
            }
        )
    }

    fn resolve_out_file(&self, path: &str) -> String {
        path.replace(
            self.get_src_dir_path().as_str(),
            self.get_out_dir_path().as_str(),
        )
        .to_string()
    }
}

async fn translate<AssetResolver>(
    into: &str,
    path: &str,
    graph: &Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
    options: TranslateOptions,
) -> Result<Option<String>>
where
    AssetResolver: Fn(&str) -> String + 'static,
{
    Ok(match into {
        "css" => Some(translate_css(path, graph, resolve_asset).await?),
        "html" => Some(translate_html(path, graph, resolve_asset, options).await?),
        _ => None,
    })
}

async fn translate_css<AssetResolver>(
    path: &str,
    graph: &Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
) -> Result<String>
where
    AssetResolver: Fn(&str) -> String + 'static,
{
    Ok(serialize_css(
        &evaluate_css(
            path,
            graph,
            Rc::new(Box::new(move |v: &str| resolve_asset(v))),
        )
        .await?,
    ))
}

async fn translate_html<AssetResolver>(
    path: &str,
    graph: &Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
    options: TranslateOptions,
) -> Result<String>
where
    AssetResolver: Fn(&str) -> String + 'static,
{
    let body = serialize_html(
        &evaluate_html(
            path,
            graph,
            Rc::new(Box::new(move |v: &str| resolve_asset(v))),
            HTMLOptions {
                include_components: false,
            },
        )
        .await?,
    );

    let head = options
        .global_imports
        .iter()
        .map(|imp: &String| {
            if imp.contains(".css") {
                format!("<link rel=\"stylesheet\" href=\"{}\">", imp)
            } else {
                "".to_string()
            }
        })
        .collect::<Vec<String>>()
        .join("\n");

    // format it property
    let html = format!(
        r#"
<!doctype html>
<html>
    <head>
        {}
    </head>
    <body>
{}
    </body>
</html>
  "#,
        head,
        indent(body.as_str().trim(), "        ")
    );

    Ok(html)
}
