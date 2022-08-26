use super::ast;
use crate::base::ast as base_ast;
use crate::css::ast as css_ast;
use crate::css::serializer::{serialize_decl_value, serialize_declarations};
use crate::docco::ast as docco_ast;
use crate::docco::serialize::serialize_comment as serialize_doc_comment;
use paperclip_common::serialize_context::Context;

pub fn serialize(document: &ast::Document) -> String {
    let mut context = Context::new(0);
    serialize_document(document, &mut context);
    context.buffer
}

fn serialize_document(document: &ast::Document, context: &mut Context) {
    for item in &document.body {
        match item {
            ast::DocumentBodyItem::DocComment(docco) => serialize_doc_comment2(docco, context),
            ast::DocumentBodyItem::Import(imp) => serialize_import(imp, context),
            ast::DocumentBodyItem::Atom(imp) => serialize_atom(imp, context),
            ast::DocumentBodyItem::Component(comp) => serialize_component(comp, context),
            ast::DocumentBodyItem::Style(style) => serialize_style(style, context),
            ast::DocumentBodyItem::Element(element) => serialize_element(element, context),
            ast::DocumentBodyItem::Trigger(element) => serialize_trigger(element, context),
            ast::DocumentBodyItem::Text(text) => serialize_text(text, context),
        }
    }
}

fn serialize_import(imp: &ast::Import, context: &mut Context) {
    context.add_buffer(format!("import \"{}\" as {}\n", imp.path, imp.namespace).as_str());
}

fn serialize_trigger(trigger: &ast::Trigger, context: &mut Context) {
    context.add_buffer(format!("trigger {} {{\n", trigger.name).as_str());
    context.start_block();
    for item in &trigger.body {
        context.add_buffer(format!("\"{}\"\n", item.value).as_str());
    }
    context.end_block();
    context.add_buffer("}");
}
fn serialize_atom(atom: &ast::Atom, context: &mut Context) {
    if atom.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer(format!("token {} ", atom.name).as_str());
    serialize_decl_value(&atom.value, context);
}

fn serialize_doc_comment2(docco: &docco_ast::Comment, context: &mut Context) {
    serialize_doc_comment(docco, context);
    context.add_buffer("\n");
}

fn serialize_component(component: &ast::Component, context: &mut Context) {
    if component.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer(format!("component {} {{\n", component.name).as_str());
    context.start_block();

    for item in &component.body {
        match item {
            ast::ComponentBodyItem::Render(render) => serialize_render(render, context),
            ast::ComponentBodyItem::Variant(variant) => serialize_variant(variant, context),
            ast::ComponentBodyItem::Script(script) => serialize_script(script, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

fn serialize_style(style: &ast::Style, context: &mut Context) {
    if style.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer("style");
    if let Some(name) = &style.name {
        context.add_buffer(format!(" {}", name).as_str());
    }

    if let Some(variant_name) = &style.variant_name {
        context.add_buffer(format!(" variant {}", variant_name).as_str());
    }

    if let Some(extends) = &style.extends {
        context.add_buffer(
            format!(
                " extends {}",
                extends
                    .into_iter()
                    .map(|reference| { reference.path.join(".") })
                    .collect::<Vec<String>>()
                    .join(", ")
            )
            .as_str(),
        );
    }

    context.add_buffer(
        format!(
            " {}",
            serialize_declarations(&style.declarations, context.depth)
        )
        .as_str(),
    );
}

fn serialize_override(over: &ast::Override, context: &mut Context) {
    if over.path.len() > 0 {
        context.add_buffer(format!("override {} {{\n", over.path.join(".")).as_str());
    } else {
        context.add_buffer(format!("override {{\n").as_str());
    }

    context.start_block();
    for item in &over.body {
        match item {
            ast::OverrideBodyItem::Style(style) => serialize_style(style, context),
            ast::OverrideBodyItem::Variant(variant) => serialize_variant(variant, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

fn serialize_render(imp: &ast::Render, context: &mut Context) {
    context.add_buffer("render ");
    serialize_render_node(&imp.node, context);
}

fn serialize_render_node(node: &ast::RenderNode, context: &mut Context) {
    match node {
        ast::RenderNode::Text(text) => serialize_text(text, context),
        ast::RenderNode::Slot(slot) => serialize_slot(slot, context),
        ast::RenderNode::Element(text) => serialize_element(text, context),
    }
}

fn serialize_text(node: &ast::TextNode, context: &mut Context) {
    context.add_buffer("text");
    maybe_serialize_ref_name(&node.name, context);
    if let Some(value) = &node.value {
        context.add_buffer(format!(" \"{}\"", value).as_str());
    }
    if node.body.len() > 0 {
        context.add_buffer(" {\n");
        context.start_block();
        for item in &node.body {
            match item {
                ast::TextNodeBodyItem::Style(style) => serialize_style(style, context),
            }
        }
        context.end_block();
        context.add_buffer("}");
    }

    context.add_buffer("\n");
}

fn serialize_element(node: &ast::Element, context: &mut Context) {
    if let Some(namespace) = &node.namespace {
        context.add_buffer(format!("{}.", namespace).as_str());
    }
    context.add_buffer(format!("{}", node.tag_name).as_str());
    maybe_serialize_ref_name(&node.name, context);
    if node.parameters.len() > 0 {
        serialize_parameters(&node.parameters, context);
    }
    if node.body.len() > 0 {
        context.add_buffer(" {\n");
        context.start_block();
        for item in &node.body {
            match item {
                ast::ElementBodyItem::Element(element) => serialize_element(element, context),
                ast::ElementBodyItem::Slot(slot) => serialize_slot(slot, context),
                ast::ElementBodyItem::Insert(insert) => serialize_insert(insert, context),
                ast::ElementBodyItem::Style(style) => serialize_style(style, context),
                ast::ElementBodyItem::Override(over) => serialize_override(over, context),
                ast::ElementBodyItem::Text(text) => serialize_text(text, context),
            }
        }
        context.end_block();
        context.add_buffer("}");
    }
    context.add_buffer("\n");
}

fn maybe_serialize_ref_name(ref_name: &Option<String>, context: &mut Context) {
    if let Some(ref_name) = ref_name {
        context.add_buffer(format!(" {}", ref_name).as_str());
    }
}

fn serialize_parameters(parameters: &Vec<ast::Parameter>, context: &mut Context) {
    context.add_buffer("(");
    let mut it = parameters.into_iter().peekable();
    while let Some(param) = it.next() {
        serialize_parameter(param, context);
        if it.peek().is_some() {
            context.add_buffer(", ");
        }
    }

    context.add_buffer(")");
}

fn serialize_parameter(param: &ast::Parameter, context: &mut Context) {
    context.add_buffer(format!("{}: ", param.name).as_str());
    serialize_simple_expression(&param.value, context);
}

fn serialize_slot(slot: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("slot {} {{\n", slot.name).as_str());
    context.start_block();
    for item in &slot.body {
        match item {
            ast::SlotBodyItem::Element(element) => serialize_element(element, context),
            ast::SlotBodyItem::Text(text) => serialize_text(text, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

fn serialize_insert(insert: &ast::Insert, context: &mut Context) {
    context.add_buffer(format!("insert {} {{\n", insert.name).as_str());
    context.start_block();
    for item in &insert.body {
        match item {
            ast::InsertBody::Element(element) => serialize_element(element, context),
            ast::InsertBody::Text(text) => serialize_text(text, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

fn serialize_simple_expression(node: &ast::SimpleExpression, context: &mut Context) {
    match node {
        ast::SimpleExpression::String(value) => serialize_string(value, context),
        ast::SimpleExpression::Number(value) => serialize_number(value, context),
        ast::SimpleExpression::Reference(value) => serialize_reference(value, context),
        ast::SimpleExpression::Boolean(value) => serialize_boolean(value, context),
        ast::SimpleExpression::Array(value) => serialize_array(value, context),
    }
}

fn serialize_string(node: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", node.value).as_str());
}

fn serialize_number(node: &ast::Number, context: &mut Context) {}
fn serialize_reference(node: &ast::Reference, context: &mut Context) {
    context.add_buffer(node.path.join(".").as_str());
}

fn serialize_array(node: &ast::Array, context: &mut Context) {
    context.add_buffer("[");
    serialize_items(&node.items, context, serialize_simple_expression);
    context.add_buffer("]");
}

fn serialize_items<TItem, TSerializeFun>(
    items: &Vec<TItem>,
    context: &mut Context,
    serialize_item: TSerializeFun,
) where
    TSerializeFun: Fn(&TItem, &mut Context),
{
    let mut it = items.into_iter().peekable();
    while let Some(item) = it.next() {
        serialize_item(&item, context);
        if it.peek().is_some() {
            context.add_buffer(", ");
        }
    }
}

fn serialize_boolean(node: &ast::Boolean, context: &mut Context) {
    context.add_buffer(if node.value { "true" } else { "false" });
}

fn serialize_variant(imp: &ast::Variant, context: &mut Context) {
    context.add_buffer(format!("variant {} ", imp.name).as_str());
    serialize_parameters(&imp.parameters, context);
    context.add_buffer("\n");
}

fn serialize_script(script: &ast::Script, context: &mut Context) {
    context.add_buffer("script");
    serialize_parameters(&script.parameters, context);
    context.add_buffer("\n");
}
