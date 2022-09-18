use anyhow::Result;
use super::context::Context;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::ast;

pub fn compile_typed_definition(dep: &Dependency) -> Result<String> {
  let mut context = Context::new(dep);
  compile_document(&mut context);
  Ok(context.get_buffer())
}

fn compile_document(context: &mut Context) {
  context.add_buffer("import * as React from \"react\";\n\n");
  compile_components(context);
}

fn compile_components(context: &mut Context) {
  for item in &context.dependency.document.body {
    if let ast::DocumentBodyItem::Component(component) = item {
      if component.is_public {
        compile_component(component, context);
      }
    }
  }
}

fn compile_component(component: &ast::Component, context: &mut Context) {
  context.add_buffer(format!("export const {}: React.FC<any>;\n", component.name).as_str());
}
