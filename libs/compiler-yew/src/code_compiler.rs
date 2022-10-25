use super::context::Context;
use anyhow::Result;
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
    context.add_buffer("use yew::{function_component, Children, html, Properties};\n");
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
        $context.add_buffer("\n");
        $context.start_block();

        let mut children = $expr.into_iter().peekable();
        while let Some(child) = children.next() {
            ($cb)(child);
            $context.add_buffer("\n");
        }
        $context.end_block();
    }};
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    compile_component_props(component, context);

    context.add_buffer("#[function_component]\n");

    if component.is_public {
        context.add_buffer("pub ");
    }

    context.add_buffer(
        format!(
            "fn {}(props: &{}Props) -> Html {{\n",
            component.name, component.name
        )
        .as_str(),
    );
    context.start_block();
    compile_render(
        &component
            .get_render_expr()
            .expect("render function must exist"),
        &mut context.within_component(component),
    );
    context.end_block();
    context.add_buffer("}\n\n");
}

fn compile_component_props(component: &ast::Component, context: &mut Context) {
    context.add_buffer("#[derive(Properties, PartialEq)]\n");
    if component.is_public {
        context.add_buffer("pub ");
    }
    context.add_buffer(format!("struct {}Props {{\n", component.name).as_str());
    context.start_block();
    context.add_buffer("pub __scope_class_name: Option<String>,\n");
    context.add_buffer("#[prop_or_default]\n");
    context.add_buffer("pub children: Children\n");
    context.end_block();
    context.add_buffer("}\n");
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
    let is_instance = context
        .dependency
        .document
        .contains_component_name(&element.tag_name)
        || element.namespace != None;

    context.add_buffer(format!("<{}", element.tag_name).as_str());
    compile_attributes(element, is_instance, is_root, context);

    context.add_buffer(">");
    compile_element_children(element, context);
    context.add_buffer(format!("</{}", element.tag_name).as_str());
    context.add_buffer(">\n");
}

fn compile_element_children(element: &ast::Element, context: &mut Context) {
    let visible_children = element.get_visible_children();

    if visible_children.len() == 0 {
        return;
    }

    compile_children! {
      &visible_children,
      |child: &ast::ElementBodyItem| {
        match child.get_inner() {
          ast::element_body_item::Inner::Text(expr) => compile_text_node(&expr, context),
          ast::element_body_item::Inner::Element(expr) => compile_element(&expr, false, context),
          ast::element_body_item::Inner::Slot(expr) => compile_slot(&expr, context),
          _ => {}
        };
      },
      context
    }
}

fn compile_attributes(
    element: &ast::Element,
    is_instance: bool,
    is_root: bool,
    context: &mut Context,
) {
    let raw_attrs = get_raw_element_attrs(element, is_instance, is_root, context);

    for (name, value) in &raw_attrs {
        context.add_buffer(format!(" {}={{{}}}", name, value.get_buffer()).as_str())
    }
}

fn get_raw_element_attrs<'dependency>(
    element: &ast::Element,
    is_instance: bool,
    is_root: bool,
    context: &mut Context<'dependency>,
) -> BTreeMap<String, Context<'dependency>> {
    let mut attrs: BTreeMap<String, Context<'dependency>> = BTreeMap::new();

    for parameter in &element.parameters {
        let mut param_context = context.with_new_content();
        compile_simple_expression(
            &parameter.value.as_ref().expect("Value must exist"),
            &mut param_context,
        );
        attrs.insert(parameter.name.to_string(), param_context);
    }

    if element.is_stylable() {
        let mut sub = context.with_new_content();
        sub.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&element.name, &element.id, context.current_component)
            )
            .as_str(),
        );

        if is_root {
            let mut subsub = sub.with_new_content();

            subsub.add_buffer("if let Some(scope_class_name) = &props.__scope_class_name {\n");
            subsub.start_block();
            subsub.add_buffer(
                format!(
                    "format!(\"{{}} {{}}\", {}, scope_class_name)\n",
                    sub.get_buffer()
                )
                .as_str(),
            );
            subsub.end_block();
            subsub.add_buffer("} else {\n");
            subsub.start_block();
            subsub.add_buffer(format!("{}.to_string()\n", sub.get_buffer().as_str()).as_str());
            subsub.end_block();
            subsub.add_buffer("}");

            sub = subsub;
        }

        if is_instance {
            attrs.insert("__scopeClassName".to_string(), sub);
        } else {
            if let Some(class) = attrs.get_mut("class") {
                class.add_buffer(format!(" + \" \" + {}", sub.get_buffer()).as_str());
            } else {
                attrs.insert("class".to_string(), sub);
            }
        }
    }

    for insert in &element.get_inserts() {
        let mut sub = context.with_new_content();
        compile_insert(insert, &mut sub);
        attrs.insert(insert.name.to_string(), sub);
    }

    attrs
}

fn compile_insert(insert: &ast::Insert, context: &mut Context) {
    compile_children! {
      &insert.body,
      |child: &ast::InsertBody| {
        match child.get_inner() {
          ast::insert_body::Inner::Element(expr) => compile_element(&expr,false, context),
          ast::insert_body::Inner::Text(expr) => compile_text_node(&expr, context),
          ast::insert_body::Inner::Slot(expr) => compile_slot(&expr, context)
        }
      },
      context
    }
}

fn compile_text_node(text: &ast::TextNode, context: &mut Context) {}
fn compile_slot(expr: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("{{ for props.{}.iter() }}\n", expr.name).as_str());
}

fn compile_simple_expression(expr: &ast::SimpleExpression, context: &mut Context) {
    match expr.get_inner() {
        ast::simple_expression::Inner::Str(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Number(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Boolean(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        _ => {}
    }
}
