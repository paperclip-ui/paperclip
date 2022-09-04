use super::config::{CompilerOptions, Config};
use anyhow::Result;
use paperclip_runtime::css::evaluator::evaluate as evaluate_css;
use paperclip_runtime::css::serializer::serialize as serialize_css;
use paperclip_parser::graph::graph::{Dependency, Graph};
use paperclip_runtime::html::evaluator::evaluate as evaluate_html;
use paperclip_runtime::html::serializer::serialize as serialize_html;
use std::collections::HashMap;
use std::rc::Rc;

#[derive(Debug)]
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

        if options.can_emit("css") {
            data.insert("css".to_string(), translate_css(path, graph).await?);
        }

        if options.can_emit("html") {
            data.insert("html".to_string(), translate_html(path, graph).await?);
        }

        Ok(data)
    }
}

async fn translate_css(path: &str, graph: &Graph) -> Result<String> {

    let map: HashMap<String, String> = HashMap::new();

    Ok(serialize_css(&evaluate_css(path, graph, Box::new(move |v:&str| {
      map.get(v).unwrap().to_string()
    })).await?))
}

async fn translate_html(path: &str, graph: &Graph) -> Result<String> {
    let body = serialize_html(&evaluate_html(path, graph, Box::new(|v:&str| {
      v.to_string()
    })).await?);

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

    // println!("{}", html);

    Ok(html)
}
