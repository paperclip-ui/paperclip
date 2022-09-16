use super::context::Context;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::ast;
use paperclip_common::get_or_short;
use std::collections::HashMap;
use anyhow::Result;

pub fn compile(dependency: &Dependency) -> Result<String> {
  let mut context = Context::new(dependency);
  compile_document(&mut context);
  Ok(context.get_buffer())
}

fn compile_document(context: &mut Context) {
    for item in &context.dependency.document.body {
        match item {
            ast::DocumentBodyItem::Component(component) => compile_component(component, context),
            _ => {}
        }
    }
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    if component.is_public {
      context.add_buffer("export ");
    }

    context
        .add_buffer(format!("const {} = () => {{\n", &component.name).as_str());

    context.start_block();
    compile_component_render(component, context);
    context.end_block();
    
    context.add_buffer("}\n\n");
}

fn compile_component_render(component: &ast::Component, context: &mut Context) {
  let render = get_or_short!(component.get_render_expr(), ());

  context.add_buffer("render ");
  match &render.node {
    ast::RenderNode::Element(element) => compile_element(element, context),
    _ => {}
  }
  context.add_buffer(";");
}

fn compile_element(element: &ast::Element, context: &mut Context) {
  context.add_buffer(format!("React.createElement(\"{}\", ", element.tag_name).as_str());
  compile_element_parameters(&element.parameters, context);
  context.add_buffer(")")
}

fn compile_element_parameters(parameters: &Vec<ast::Parameter>, context: &mut Context) {
  if parameters.len() == 0 {
    context.add_buffer("null")
  } else {
    context.add_buffer("{\n");
    context.start_block();
    for parameter in parameters {
      compile_element_parameter(parameter, context);
    }
    context.end_block();
    context.add_buffer("}");
  }
}

fn compile_element_parameter(parameter: &ast::Parameter, context: &mut Context) {

  // TODO - need to translate this name
  context.add_buffer(format!("{}:", parameter.name).as_str())
}

fn collect_element_attributes(element: &ast::Element, context: &mut Context) -> HashMap<String, String> {
  HashMap::new()
}