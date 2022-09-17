use super::context::Context;
use anyhow::Result;
use paperclip_common::get_or_short;
use paperclip_evaluator::core::utils::get_style_namespace;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::ast;
use std::collections::BTreeMap;

pub fn compile(dependency: &Dependency) -> Result<String> {
    let mut context = Context::new(&dependency);
    compile_document(&dependency.document, &mut context);
    Ok(context.get_buffer())
}

fn compile_document(document: &ast::Document, context: &mut Context) {
    context.add_buffer("import { React } from \"react\";\n\n");
    for item in &document.body {
        match item {
            ast::DocumentBodyItem::Component(component) => compile_component(component, context),
            _ => {}
        }
    }
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
    if component.is_public {
        context.add_buffer("export ");
    }

    context.add_buffer(format!("const {} = React.memo((props) => {{\n", &component.name).as_str());

    context.start_block();
    compile_component_render(component, context);
    context.end_block();

    context.add_buffer("});\n\n");
}

fn compile_component_render(component: &ast::Component, context: &mut Context) {
    let render = get_or_short!(component.get_render_expr(), ());

    context.add_buffer("return ");
    match &render.node {
        ast::RenderNode::Element(expr) => compile_element(expr, context),
        ast::RenderNode::Text(expr) => compile_text_node(expr, context),
        ast::RenderNode::Slot(expr) => compile_slot(expr, context),
    }
    context.add_buffer(";\n");
}

fn compile_text_node(node: &ast::TextNode, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", node.value).as_str());
}

fn compile_slot(node: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("props.{}", node.name).as_str());

    if node.body.len() > 0 {
        context.add_buffer(" || ");
        compile_children! {
          &node.body,
          |child: &ast::SlotBodyItem| {
            match child {
              ast::SlotBodyItem::Element(expr) => compile_element(expr, context),
              ast::SlotBodyItem::Text(expr) => compile_text_node(expr, context),
            }
          },
          context
        }
    }
}
fn compile_element(element: &ast::Element, context: &mut Context) {
    let tag_name = if context
        .dependency
        .document
        .contains_component_name(&element.tag_name)
    {
        element.tag_name.to_string()
    } else {
        format!("\"{}\"", element.tag_name)
    };

    context.add_buffer(format!("React.createElement({}, ", tag_name).as_str());
    compile_element_parameters(element, context);
    compile_element_children(element, context);
    context.add_buffer(")")
}

fn compile_element_children(element: &ast::Element, context: &mut Context) {
    let visible_children = element.get_visible_children();

    if visible_children.len() == 0 {
        return;
    }

    context.add_buffer(", ");

    compile_children! {
      &visible_children,
      |child: &ast::ElementBodyItem| {
        match child {
          ast::ElementBodyItem::Text(expr) => compile_text_node(&expr, context),
          ast::ElementBodyItem::Element(expr) => compile_element(&expr, context),
          ast::ElementBodyItem::Slot(expr) => compile_slot(&expr, context),
          _ => {}
        };
      },
      context
    }
}

fn compile_element_parameters(element: &ast::Element, context: &mut Context) {
    let raw_attrs = rename_attrs_for_react(get_raw_element_attrs(element, context));

    if raw_attrs.len() == 0 {
        context.add_buffer("null");
        return;
    }

    context.add_buffer("{\n");
    context.start_block();

    let mut attrs = raw_attrs.iter().peekable();

    while let Some((key, value)) = attrs.next() {
        context.add_buffer(format!("\"{}\": {}", key, value.get_buffer()).as_str());
        if !attrs.peek().is_none() {
            context.add_buffer(",");
        }
        context.add_buffer("\n");
    }
    context.end_block();
    context.add_buffer("}");
}

fn get_raw_element_attrs<'dependency>(
    element: &ast::Element,
    context: &mut Context<'dependency>,
) -> BTreeMap<String, Context<'dependency>> {
    let mut attrs: BTreeMap<String, Context<'dependency>> = BTreeMap::new();

    for parameter in &element.parameters {
        let mut param_context = context.with_new_content();
        compile_simple_expression(&parameter.value, &mut param_context);
        attrs.insert(parameter.name.to_string(), param_context);
    }

    if element.is_stylable() {
        let mut sub = context.with_new_content();
        sub.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&element.name, &element.id, None)
            )
            .as_str(),
        );

        if let Some(class) = attrs.get_mut("class") {
            class.add_buffer(format!(" + \" \" + {}", sub.get_buffer()).as_str());
        } else {
            attrs.insert("class".to_string(), sub);
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
        match child {
          ast::InsertBody::Element(expr) => compile_element(&expr, context),
          ast::InsertBody::Text(expr) => compile_text_node(&expr, context),
          ast::InsertBody::Slot(expr) => compile_slot(&expr, context)
        }
      },
      context
    }
}

fn rename_attrs_for_react(attrs: BTreeMap<String, Context>) -> BTreeMap<String, Context> {
    attrs
        .into_iter()
        .map(|(key, context)| (attr_alias(key.as_str()), context))
        .collect()
}

fn attr_alias(name: &str) -> String {
    (match name {
        "class" => "className",
        _ => name,
    })
    .to_string()
}

fn compile_simple_expression(expr: &ast::SimpleExpression, context: &mut Context) {
    match expr {
        ast::SimpleExpression::String(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::SimpleExpression::Number(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::SimpleExpression::Boolean(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::SimpleExpression::Array(expr) => compile_array(expr, context),
        ast::SimpleExpression::Reference(expr) => compile_reference(expr, context),
    }
}

fn compile_reference(expr: &ast::Reference, context: &mut Context) {
    let mut parts = expr.path.iter().peekable();

    while let Some(part) = parts.next() {
        context.add_buffer(format!("props.{}", part).as_str());
        if !parts.peek().is_none() {
            context.add_buffer(", ");
        }
    }
}

fn compile_array(expr: &ast::Array, context: &mut Context) {
    context.add_buffer("[");
    context.start_block();
    let mut items = expr.items.iter().peekable();
    while let Some(item) = items.next() {
        compile_simple_expression(item, context);
        if !items.peek().is_none() {
            context.add_buffer(", ");
        }
    }
    context.end_block();
    context.add_buffer("]");
}
