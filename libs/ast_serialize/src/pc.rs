use crate::css::{serialize_decl_value, serialize_declarations};
use crate::docco::serialize_comment as serialize_doc_comment;
use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::docco as docco_ast;
use paperclip_proto::ast::pc as ast;
use paperclip_proto::ast::{base as base_ast, shared};

pub fn serialize(document: &ast::Document) -> String {
    let mut context = Context::new(0);
    serialize_imports(document, &mut context);
    serialize_document(document, &mut context);
    context.buffer
}

pub fn serialize_imports(document: &ast::Document, context: &mut Context) {
    for item in &document.body {
        match item.get_inner() {
            ast::node::Inner::Import(imp) => {
                serialize_import(&imp, context);
                context.add_buffer("\n");
            }
            _ => {}
        }
    }
    context.add_buffer("\n");
}
pub fn serialize_document(document: &ast::Document, context: &mut Context) {
    for item in &document.body {
        serialize_node(&item, true, context);

        // extra space for document body items
        context.add_buffer("\n");
    }
}

pub fn serialize_import(imp: &ast::Import, context: &mut Context) {
    context.add_buffer(format!("import \"{}\" as {}", imp.path, imp.namespace).as_str());
}

pub fn serialize_trigger(trigger: &ast::Trigger, context: &mut Context) {
    if trigger.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer(format!("trigger {} ", trigger.name).as_str());
    serialize_trigger_body(&trigger.body, context);
    context.add_buffer("\n\n");
}

pub fn serialize_trigger_body(body: &Vec<ast::TriggerBodyItemCombo>, context: &mut Context) {
    context.add_buffer("{\n");
    context.start_block();

    for combo in body {
        serialize_trigger_combo(combo, context);
        context.add_buffer("\n");
    }

    context.end_block();
    context.add_buffer("}");
}

pub fn serialize_trigger_combo(combo: &ast::TriggerBodyItemCombo, context: &mut Context) {
    let mut it = combo.items.iter().peekable();

    while let Some(item) = it.next() {
        match item.get_inner() {
            ast::trigger_body_item::Inner::Str(value) => {
                context.add_buffer(format!("\"{}\"", value.value).as_str());
            }
            ast::trigger_body_item::Inner::Reference(expr) => {
                serialize_reference(&expr, context);
            }
            ast::trigger_body_item::Inner::Bool(expr) => {
                serialize_boolean(&expr, context);
            }
        }

        if !it.peek().is_none() {
            context.add_buffer(" + ");
        }
    }
}

pub fn serialize_atom(atom: &ast::Atom, context: &mut Context) {
    if atom.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer(format!("token {} ", atom.name).as_str());
    serialize_decl_value(atom.value.as_ref().expect("Value needs to exist"), context);
}

pub fn serialize_doc_comment2(docco: &docco_ast::Comment, context: &mut Context) {
    serialize_doc_comment(docco, context);
    context.add_buffer("\n");
}

pub fn serialize_component(component: &ast::Component, context: &mut Context) {
    if let Some(comment) = &component.comment {
        serialize_doc_comment2(comment, context);
    }

    if component.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer(format!("component {} {{\n", component.name).as_str());
    context.start_block();

    for item in &component.body {
        match item.get_inner() {
            ast::component_body_item::Inner::Render(render) => serialize_render(&render, context),
            ast::component_body_item::Inner::Variant(variant) => {
                serialize_variant(&variant, context)
            }
            ast::component_body_item::Inner::Script(script) => serialize_script(&script, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_style(style: &ast::Style, context: &mut Context) {
    if style.is_public {
        context.add_buffer("public ");
    }
    context.add_buffer("style");
    if let Some(name) = &style.name {
        context.add_buffer(format!(" {}", name).as_str());
    }

    if style.variant_combo.len() > 0 {
        context.add_buffer(" variant ");
        serialize_items(&style.variant_combo, context, serialize_reference, " + ");
    }

    if style.extends.len() > 0 {
        context.add_buffer(
            format!(
                " extends {}",
                style
                    .extends
                    .iter()
                    .map(|reference| { reference.path.join(".") })
                    .collect::<Vec<String>>()
                    .join(", ")
            )
            .as_str(),
        );
    }

    if style.declarations.len() > 0 {
        context.add_buffer(" {\n");
        context.start_block();
        context.add_buffer(serialize_declarations(&style.declarations, context.depth).as_str());

        context.end_block();
        context.add_buffer("}\n");
    } else {
        context.add_buffer("\n");
    }
}

pub fn serialize_override(over: &ast::Override, context: &mut Context) {
    if over.path.len() > 0 {
        context.add_buffer(format!("override {} {{\n", over.path.join(".")).as_str());
    } else {
        context.add_buffer(format!("override {{\n").as_str());
    }

    context.start_block();
    for item in &over.body {
        match item.get_inner() {
            ast::override_body_item::Inner::Style(style) => serialize_style(&style, context),
            ast::override_body_item::Inner::Variant(variant) => {
                serialize_variant(&variant, context)
            }
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_render(imp: &ast::Render, context: &mut Context) {
    context.add_buffer("render ");
    serialize_node(&imp.node.as_ref().expect("node must exist"), false, context);
}

pub fn serialize_node(node: &ast::Node, is_root: bool, context: &mut Context) {
    match node.get_inner() {
        ast::node::Inner::Element(element) => serialize_element(element, is_root, context),
        ast::node::Inner::Slot(slot) => serialize_slot(slot, context),
        ast::node::Inner::Insert(insert) => serialize_insert(insert, context),
        ast::node::Inner::Style(style) => serialize_style(style, context),
        ast::node::Inner::Override(over) => serialize_override(over, context),
        ast::node::Inner::Text(text) => serialize_text(text, is_root, context),
        ast::node::Inner::Script(text) => serialize_script(text, context),
        ast::node::Inner::Condition(expr) => serialize_condition(expr, context),
        ast::node::Inner::Switch(expr) => serialize_switch(expr, context),
        ast::node::Inner::Repeat(expr) => serialize_repeat(expr, context),
        ast::node::Inner::Component(expr) => serialize_component(expr, context),
        ast::node::Inner::DocComment(expr) => serialize_doc_comment2(expr, context),
        ast::node::Inner::Atom(expr) => serialize_atom(expr, context),
        ast::node::Inner::Trigger(expr) => serialize_trigger(expr, context),

        // already done at the top
        ast::node::Inner::Import(_) => {}
    }
}

pub fn serialize_condition(expr: &ast::Condition, context: &mut Context) {
    context.add_buffer(format!("if {} {{\n", expr.property).as_str());
    context.start_block();
    for item in &expr.body {
        serialize_node(item, false, context);
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_switch(expr: &ast::Switch, context: &mut Context) {
    context.add_buffer(format!("switch {} {{\n", expr.property).as_str());
    context.start_block();
    for item in &expr.body {
        match item.get_inner() {
            ast::switch_item::Inner::Case(expr) => {
                context.add_buffer(format!("case \"{}\" {{\n", expr.condition).as_str());
                context.start_block();
                for item in &expr.body {
                    serialize_node(item, false, context);
                }
                context.end_block();
                context.add_buffer("}\n");
            }
            ast::switch_item::Inner::Default(expr) => {
                context.add_buffer("default {\n");
                context.start_block();
                for item in &expr.body {
                    serialize_node(item, false, context);
                }
                context.end_block();
                context.add_buffer("}\n");
            }
        }
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_repeat(expr: &ast::Repeat, context: &mut Context) {
    context.add_buffer(format!("repeat {} {{\n", expr.property).as_str());
    context.start_block();
    for item in &expr.body {
        serialize_node(item, false, context);
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_text(node: &ast::TextNode, is_root: bool, context: &mut Context) {
    if is_root {
        if let Some(comment) = &node.comment {
            serialize_doc_comment2(comment, context);
        }
    }
    context.add_buffer("text");
    maybe_serialize_ref_name(&node.name, context);

    context.add_buffer(format!(" \"{}\"", node.value).as_str());

    if node.body.len() > 0 {
        context.add_buffer(" {\n");
        context.start_block();
        for item in &node.body {
            serialize_node(item, false, context);
        }
        context.end_block();
        context.add_buffer("}");
    }

    context.add_buffer("\n");
}

pub fn serialize_element(node: &ast::Element, is_root: bool, context: &mut Context) {
    if is_root {
        if let Some(comment) = &node.comment {
            serialize_doc_comment2(comment, context);
        }
    }

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
            serialize_node(item, false, context);
        }
        context.end_block();
        context.add_buffer("}");
    }
    context.add_buffer("\n");
}

pub fn maybe_serialize_ref_name(ref_name: &Option<String>, context: &mut Context) {
    if let Some(ref_name) = ref_name {
        context.add_buffer(format!(" {}", ref_name).as_str());
    }
}

pub fn serialize_parameters(parameters: &Vec<ast::Parameter>, context: &mut Context) {
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

pub fn serialize_parameter(param: &ast::Parameter, context: &mut Context) {
    context.add_buffer(format!("{}: ", param.name).as_str());
    serialize_simple_expression(
        &param.value.as_ref().expect("Value needs to exist"),
        context,
    );
}

pub fn serialize_slot(slot: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("slot {}", slot.name).as_str());

    if slot.body.len() > 0 {
        context.add_buffer(" {\n");
        context.start_block();
        for item in &slot.body {
            serialize_node(item, false, context);
        }
        context.end_block();
        context.add_buffer("}\n");
    } else {
        context.add_buffer("\n");
    }
}

pub fn serialize_insert(insert: &ast::Insert, context: &mut Context) {
    context.add_buffer(format!("insert {}", insert.name).as_str());
    context.add_buffer(" {\n");
    context.start_block();
    for item in &insert.body {
        serialize_node(item, false, context);
    }
    context.end_block();
    context.add_buffer("}\n");
}

pub fn serialize_simple_expression(node: &ast::SimpleExpression, context: &mut Context) {
    match node.get_inner() {
        ast::simple_expression::Inner::Str(value) => serialize_string(value, context),
        ast::simple_expression::Inner::Num(value) => serialize_number(value, context),
        ast::simple_expression::Inner::Reference(value) => serialize_reference(value, context),
        ast::simple_expression::Inner::Bool(value) => serialize_boolean(value, context),
        ast::simple_expression::Inner::Ary(value) => serialize_array(value, context),
    }
}

pub fn serialize_string(node: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", node.value).as_str());
}

pub fn serialize_number(_node: &base_ast::Num, _context: &mut Context) {}
pub fn serialize_reference(node: &shared::Reference, context: &mut Context) {
    context.add_buffer(node.path.join(".").as_str());
}

pub fn serialize_array(node: &ast::Ary, context: &mut Context) {
    context.add_buffer("[");
    serialize_items(&node.items, context, serialize_simple_expression, ", ");
    context.add_buffer("]");
}

pub fn serialize_items<TItem, TSerializeFun>(
    items: &Vec<TItem>,
    context: &mut Context,
    serialize_item: TSerializeFun,
    delim: &str,
) where
    TSerializeFun: Fn(&TItem, &mut Context),
{
    let mut it = items.into_iter().peekable();
    while let Some(item) = it.next() {
        serialize_item(&item, context);
        if it.peek().is_some() {
            context.add_buffer(delim);
        }
    }
}

pub fn serialize_boolean(node: &base_ast::Bool, context: &mut Context) {
    context.add_buffer(if node.value { "true" } else { "false" });
}

pub fn serialize_variant(variant: &ast::Variant, context: &mut Context) {
    context.add_buffer(format!("variant {}", variant.name).as_str());
    if variant.triggers.len() > 0 {
        context.add_buffer(" trigger ");
        serialize_trigger_body(&variant.triggers, context);
    }
    context.add_buffer("\n");
}

pub fn serialize_script(script: &ast::Script, context: &mut Context) {
    context.add_buffer("script");
    serialize_parameters(&script.parameters, context);
    context.add_buffer("\n");
}
