use super::config::{CompilerOptions, Config};
use anyhow::Result;
use paperclip_evaluator::css::evaluator::evaluate as evaluate_css;
use paperclip_evaluator::css::serializer::serialize as serialize_css;
use paperclip_evaluator::html::evaluator::{evaluate as evaluate_html, Options as HTMLOptions};
use paperclip_evaluator::html::serializer::serialize as serialize_html;
use paperclip_parser::graph::graph::{Graph};
use std::collections::HashMap;
use std::rc::Rc;
use std::path::Path;
use path_absolutize::*;

pub struct TargetCompiler {
    options: CompilerOptions,
    config: Config
}
impl<'options> TargetCompiler {
    // TODO: load bin
    pub fn load(options: CompilerOptions, config: Config) -> Self {
        Self { options, config }
    }

    pub async fn compile_graph(&self, graph: &Graph, project_dir: &String) -> Result<HashMap<String, String>> {

        let mut all_files = HashMap::new();
        for (path, _) in &graph.dependencies {
            let files = compile_dependency(path, &graph, &self.options, project_dir).await?;
            all_files.extend(files);
        }

        Ok(all_files)
    }
}

async fn compile_dependency(path: &str, graph: &Graph, options: &CompilerOptions, project_dir: &String) -> Result<HashMap<String, String>> {
    let data = translate_with_options(path, graph, &options).await?;

        let mut files = HashMap::new();
        let out_file = resolve_out_file(path, &options.out_dir, project_dir);

        for (ext, content) in data {
            let compiled_file = format!("{}.{}", out_file, ext);
            files.insert(compiled_file, content);
        }


        Ok(files)
}

async fn translate_with_options(path: &str, graph: &Graph, options: &CompilerOptions) -> Result<HashMap<String, String>> {

    let mut data = HashMap::new();

    let resolve_asset = Rc::new(Box::new(|v: &str| v.to_string()));

    if let Some(emit) = &options.emit {
        for ext in emit {
            if let Some(code) = translate(ext, path, graph, resolve_asset.clone()).await? {
                data.insert(ext.to_string(), code);
            }
        }
    }

    Ok(data)
}


fn resolve_out_file(path: &str, out_dir: &Option<String>, project_dir: &String) -> String {

    let out_dir = if let Some(out_dir) = out_dir {
        String::from(Path::new(&project_dir)
        .join(out_dir.clone())
        .absolutize()
        .unwrap()
        .to_str()
        .unwrap())
    } else {
        String::from(Path::new(project_dir.as_str())
        .absolutize()
        .unwrap()
        .to_str()
        .unwrap())
    };

    path.replace(project_dir, out_dir.as_str()).to_string()
}

async fn translate<AssetResolver>(
    into: &str,
    path: &str,
    graph: &Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
) -> Result<Option<String>>
where
    AssetResolver: Fn(&str) -> String + 'static,
{
    Ok(match into {
        "css" => Some(translate_css(path, graph, resolve_asset).await?),
        "html" => Some(translate_html(path, graph, resolve_asset).await?),
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

    let html = format!(
        r#"
    <!doctype html>
    <html>
      <head>
      </head>
      <body>
        {}
      </body>
    </html>
  "#,
        body
    );

    Ok(html)
}
