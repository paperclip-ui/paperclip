use super::context::TargetCompilerContext;
use paperclip_config::{CompilerOptions, ConfigContext};
use anyhow::Result;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_compiler_react::{
    compile_code as compile_react_code, compile_typed_definition as compile_react_typed_definition,
};
use paperclip_evaluator::css::evaluator::evaluate as evaluate_css;
use paperclip_evaluator::css::serializer::serialize as serialize_css;
use paperclip_evaluator::html::evaluator::{evaluate as evaluate_html, Options as HTMLOptions};
use paperclip_evaluator::html::serializer::serialize as serialize_html;
use paperclip_parser::graph::Graph;
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::sync::Mutex;
use textwrap::indent;

struct TargetCompilerResolver<IO: FileReader + FileResolver> {
    io: IO,
    context: TargetCompilerContext,
}

struct EmitInfo {
    compiler_name: String,
    extension_name: String,
}

impl<IO: FileReader + FileResolver> FileResolver for TargetCompilerResolver<IO> {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String> {
        let resolved_path = self.io.resolve_file(from, to).and_then(|resolved_path| {
            Some(self.context.resolve_asset_out_file(resolved_path.as_str()))
        });

        resolved_path
    }
}

pub struct TargetCompiler<IO: FileReader + FileResolver> {
    context: TargetCompilerContext,
    all_compiled_css: Mutex<BTreeMap<String, String>>,
    file_resolver: TargetCompilerResolver<IO>,
}

struct TranslateOptions {
    global_imports: Vec<String>,
}

impl<'options, IO: FileReader + FileResolver> TargetCompiler<IO> {
    // TODO: load bin
    pub fn new(options: CompilerOptions, config_context: ConfigContext, io: IO) -> Self {
        let context = TargetCompilerContext {
            options,
            config_context,
        };

        Self {
            context: context.clone(),
            all_compiled_css: Mutex::new(BTreeMap::new()),
            file_resolver: TargetCompilerResolver { io, context },
        }
    }

    pub async fn compile_files(
        &self,
        file_paths: &Vec<String>,
        graph: &Graph,
    ) -> Result<BTreeMap<String, String>> {
        let mut all_compiled_files: BTreeMap<String, String> = BTreeMap::new();
        let mut all_compiled_css = self.all_compiled_css.lock().unwrap();

        for dep_file_path in file_paths {
            let compiled_files = self
                .compile_dependency(dep_file_path, &graph, &self.file_resolver)
                .await?;
            for (file_path, content) in compiled_files {
                if self.context.options.main_css_file_name != None && file_path.contains(".css") {
                    all_compiled_css.insert(file_path.to_string(), content.to_string());
                } else {
                    all_compiled_files.insert(file_path.to_string(), content.to_string());
                }
            }
        }

        if let Some(main_css_file_path) = &self.context.get_main_css_file_path() {
            all_compiled_files.insert(
                main_css_file_path.to_string(),
                all_compiled_css
                    .iter()
                    .map(|(key, content)| format!("/* {} */\n{}", key, content))
                    .collect::<Vec<String>>()
                    .join("\n\n"),
            );
        }

        Ok(all_compiled_files)
    }

    async fn compile_dependency<F: FileResolver>(
        &self,
        path: &str,
        graph: &Graph,
        file_resolver: &F,
    ) -> Result<HashMap<String, String>> {
        let data = self
            .translate_with_options(path, graph, file_resolver)
            .await?;

        let mut files = HashMap::new();
        let out_file = &self.context.resolve_out_file(path);

        for (ext, content) in data {
            let compiled_file = format!("{}.{}", out_file, ext);
            files.insert(compiled_file, content);
        }

        Ok(files)
    }

    async fn translate_with_options<F: FileResolver>(
        &self,
        path: &str,
        graph: &Graph,
        file_resolver: &F,
    ) -> Result<HashMap<String, String>> {
        let mut data = HashMap::new();

        if let Some(emit) = &self.context.options.emit {
            for ext in emit {
                let info = extract_emit_info(ext);

                if let Some(code) = translate(
                    &info.compiler_name,
                    path,
                    graph,
                    file_resolver,
                    self.get_ext_translate_options(ext, path, graph),
                )
                .await?
                {
                    data.insert(info.extension_name.to_string(), code);
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

                if let Some(main_css_path) = &self.context.get_main_css_file_path() {
                    imports.push(format!("{}", main_css_path));
                } else {
                    imports.push(format!("{}.css", path));

                    imports.extend(
                        graph
                            .get_all_dependencies(path)
                            .iter()
                            .map(|dep| format!("{}.css", dep.path)),
                    )
                };

                imports
            },
        }
    }
}

async fn translate<F: FileResolver>(
    into: &str,
    path: &str,
    graph: &Graph,
    file_resolver: &F,
    options: TranslateOptions,
) -> Result<Option<String>> {
    Ok(match into {
        "css" => Some(translate_css(path, graph, file_resolver).await?),
        "html" => Some(translate_html(path, graph, file_resolver, options).await?),
        "react.js" => Some(compile_react_code(graph.dependencies.get(path).unwrap())?),
        "react.d.ts" => Some(compile_react_typed_definition(
            graph.dependencies.get(path).unwrap(),
        )?),
        _ => None,
    })
}

fn extract_emit_info(value: &str) -> EmitInfo {
    let info = value.split(":").collect::<Vec<&str>>();
    let compiler_name = info.get(0).unwrap().to_string();
    let extension_name = if let Some(part) = info.get(1) {
        part.to_string()
    } else {
        compiler_name.to_string()
    };

    EmitInfo {
        compiler_name,
        extension_name,
    }
}

async fn translate_css<F: FileResolver>(
    path: &str,
    graph: &Graph,
    file_resolver: &F,
) -> Result<String> {
    Ok(serialize_css(
        &evaluate_css(path, graph, file_resolver).await?,
    ))
}

async fn translate_html<F: FileResolver>(
    path: &str,
    graph: &Graph,
    file_resolver: &F,
    options: TranslateOptions,
) -> Result<String> {
    let body = serialize_html(
        &evaluate_html(
            path,
            graph,
            file_resolver,
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
