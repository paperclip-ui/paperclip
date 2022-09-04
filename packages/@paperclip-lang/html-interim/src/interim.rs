use paperclip_parser::pc::ast;
use anyhow::Result;
use super::state as interim;
use super::context::Context;


type AssetResolver = dyn Fn(&str) -> String;

pub fn translate_interim(document: &ast::Document, resolve_asset: Box<AssetResolver>) -> Result<interim::Module> {
  let mut context = Context::new(document, resolve_asset);
  let body = vec![];
  Ok(interim::Module {
    source_id: document.id.to_string(),
    body
  })
}



// fn translate_body(context: &Context) -> Vec<interim::ModuleBodyItem> {
//   let mut body = vec![];
//   for item in &context.document.body {
//     match item {
//       ast::DocumentBodyItem::Element(element) => {
        
//       }
//     }
//   }
// }

// fn translate_element(element: &ast::Element, context: &Context) -> interim::Element {

//   interim::Element {
//     attributes,
//     child_nodes
//   }
// }

// fn translate_element_children(element: &ast::Element, context: &Context) -> Vec<interim::Node> {

//   let mut child_nodes = vec![];

//   for child in &element.body {
//     match child {
//       ast::ElementBodyItem::
//     }
//   }

//   child_nodes
// }