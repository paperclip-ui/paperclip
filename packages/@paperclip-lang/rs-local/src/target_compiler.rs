use super::config::{CompilerOptions, Config};
use anyhow::Result;
use futures::Future;
use paperclip_evaluator::css::evaluator::evaluate as evaluate_css;
use paperclip_evaluator::css::serializer::serialize as serialize_css;
use paperclip_evaluator::html::evaluator::{evaluate as evaluate_html, Options as HTMLOptions};
use paperclip_evaluator::html::serializer::serialize as serialize_html;
use paperclip_parser::graph::graph::{Dependency, Graph};
use std::collections::HashMap;
use std::rc::Rc;

pub struct TargetCompiler {
    options: Rc<CompilerOptions>,
}

type AssetResolver = dyn Fn(&str) -> String;
impl<'options> TargetCompiler {
    // TODO: load bin
    pub fn load(options: Rc<CompilerOptions>) -> Self {
        Self { options }
    }
    pub async fn compile_dependency(
        &self,
        path: &str,
        graph: &Graph,
    ) -> Result<HashMap<String, String>> {
        let options = self.options.as_ref();

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
