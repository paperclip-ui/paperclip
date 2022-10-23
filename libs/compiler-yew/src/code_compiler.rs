use super::context::Context;
use anyhow::Result;
use paperclip_common::get_or_short;
use paperclip_evaluator::core::utils::get_style_namespace;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::ast;
use std::collections::BTreeMap;

pub fn compile_code(dependency: &Dependency) -> Result<String> {
    let mut context = Context::new(&dependency);
    compile_document(&dependency.document, &mut context);
    Ok(context.get_buffer())
}

fn compile_document(document: &ast::Document, context: &mut Context) {
    compile_imports(document, context);
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                compile_component(&component, context)
            }
            _ => {}
        }
    }
}

fn compile_imports(document: &ast::Document, context: &mut Context) {
    
    
    context.add_buffer("use yew::prelude::*;\n");
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Import(import) => {
                compile_import(import, context);
            }
            _ => {}
        }
    }
    context.add_buffer("\n");
}

fn compile_import(import: &ast::Import, context: &mut Context) {
    context
        .add_buffer(format!("import * as {} from \"{}\";", import.namespace, import.path).as_str());
}

macro_rules! compile_children {
    ($expr: expr, $cb: expr, $context: expr) => {{
        $context.add_buffer("[\n");
        $context.start_block();

        let mut children = $expr.into_iter().peekable();
        while let Some(child) = children.next() {
            ($cb)(child);

            if !children.peek().is_none() {
                $context.add_buffer(", ");
            }
            $context.add_buffer("\n");
        }
        $context.end_block();
        $context.add_buffer("]");
    }};
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    context.add_buffer("#[function_component]\n");


    if component.is_public {
        context.add_buffer("pub ");
    }

    context.add_buffer(format!("fn {}() -> Html {{\n", component.name).as_str());
    context.start_block();
    compile_render(&component.get_render_expr().expect("render function must exist"), context);
    context.end_block();
    context.add_buffer("}\n\n");
}

fn compile_render(render: &ast::Render, context: &mut Context) {
    context.add_buffer("html! {\n");
    context.start_block();    
    match render.node.as_ref().expect("Node must exist").get_inner() {
        ast::render_node::Inner::Element(expr) => compile_element(&expr, true, context),
        ast::render_node::Inner::Text(expr) => compile_text_node(&expr, context),
        ast::render_node::Inner::Slot(expr) => compile_slot(&expr, context),
    }
    context.end_block();
    context.add_buffer("}\n");
}



fn compile_element(element: &ast::Element, is_root: bool, context: &mut Context) {
    context.add_buffer(format!("<{}", element.tag_name).as_str());
    context.add_buffer(">");
    context.add_buffer(format!("</{}", element.tag_name).as_str());
    context.add_buffer(">");
}

fn compile_text_node(text: &ast::TextNode, context: &mut Context) {

}
fn compile_slot(element: &ast::Slot, context: &mut Context) {

}