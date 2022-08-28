use super::config::{Config, CompilerOptions};
use paperclip_parser::graph::graph::{Graph, Dependency};
use std::rc::Rc;
use std::collections::HashMap;
use paperclip_runtime::css::evaluator::evaluate as evaluate_css;
use paperclip_runtime::css::serializer::serialize as serialize_css;
use paperclip_runtime::html::evaluator::evaluate as evaluate_html;
use paperclip_runtime::html::serializer::serialize as serialize_html;
use anyhow::Result;



#[derive(Debug)]
pub struct TargetCompiler {
  options: Rc<CompilerOptions>
}

impl<'options> TargetCompiler {

  // TODO: load bin
  pub fn load(options: Rc<CompilerOptions>) -> Self {
    Self {
      options
    }
  }
  pub async fn  compile_dependency(&self, path: &str, graph: &Graph) -> Result<HashMap<String, String>> {
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
  Ok(serialize_css(&evaluate_css(path, graph).await?))
}

async fn translate_html(path: &str, graph: &Graph) -> Result<String> {

  let body = serialize_html(&evaluate_html(path, graph).await?);


  let html = format!(r#"
    <!doctype html>
    <html>
      <head>
      </head>
      <body>
        {}
      </body>
    </html>
  "#, body);

  Ok(html)
}