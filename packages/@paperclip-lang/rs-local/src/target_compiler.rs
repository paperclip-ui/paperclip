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

        if let Some(emit) = &options.emit {
            for ext in emit {
                if let Some(code) = translate(ext, path, graph).await? {
                    data.insert(ext.to_string(), code);
                }
            }
        }

        Ok(data)
    }
}

async fn translate(into: &str, path: &str, graph: &Graph) -> Result<Option<String>> {
    Ok(match into {
        "css" => Some(translate_css(path, graph).await?),
        "html" => Some(translate_html(path, graph).await?),

        // TODO
        // "tsx" => Some(translate_html(path, graph).await?),
        _ => None,
    })
}

async fn translate_css(path: &str, graph: &Graph) -> Result<String> {
    let map: HashMap<String, String> = HashMap::new();

    Ok(serialize_css(
        &evaluate_css(
            path,
            graph,
            Box::new(move |v: &str| map.get(v).unwrap().to_string()),
        )
        .await?,
    ))
}

async fn translate_html(path: &str, graph: &Graph) -> Result<String> {
    let body = serialize_html(
        &evaluate_html(
            path,
            graph,
            Box::new(|v: &str| v.to_string()),
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
