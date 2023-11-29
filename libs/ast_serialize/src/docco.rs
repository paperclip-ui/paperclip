use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::base as base_ast;
use paperclip_proto::ast::docco as ast;

pub fn serialize(comment: &ast::Comment) -> String {
    let mut context = Context::new(0);
    serialize_comment(comment, &mut context);
    context.buffer
}

pub fn serialize_comment(comment: &ast::Comment, context: &mut Context) {
    context.add_buffer("/**");
    for item in &comment.body {
        match &item.get_inner() {
            ast::comment_body_item::Inner::Text(text) => serialize_text(text, context),
            ast::comment_body_item::Inner::Property(property) => {
                serialize_property(property, context)
            }
        }
    }
    context.add_buffer("*/");
}

fn serialize_text(text: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("{}", text.value).as_str());
}

fn serialize_property(prop: &ast::Property, context: &mut Context) {
    context.add_buffer(format!("@{}", prop.name).as_str());
    let value = prop.value.as_ref().expect("value must exist");
    if !matches!(value.get_inner(), ast::property_value::Inner::Parameters(_)) {
        context.add_buffer(" ");
    }
    serialize_parameter_value(value, context);
}

fn serialize_string(value: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", value.value).as_str());
}

fn serialize_boolean(value: &base_ast::Bool, context: &mut Context) {
    context.add_buffer(format!("{}", if value.value { "true" } else { "false" }).as_str());
}

fn serialize_parameters(value: &ast::PropertyValueMap, context: &mut Context) {
    context.add_buffer("(");
    let mut it = (&value.items).into_iter().peekable();
    while let Some(param) = it.next() {
        serialize_parameter(param, context);
        if it.peek().is_some() {
            context.add_buffer(", ");
        }
    }

    context.add_buffer(")");
}
fn serialize_list(value: &ast::PropertyValueList, context: &mut Context) {
    context.add_buffer("[");
    let mut it = (&value.items).into_iter().peekable();
    while let Some(param) = it.next() {
        serialize_parameter_value(param, context);
        if it.peek().is_some() {
            context.add_buffer(", ");
        }
    }

    context.add_buffer("]");
}

fn serialize_parameter(value: &ast::Property, context: &mut Context) {
    context.add_buffer(format!("{}: ", value.name).as_str());
    serialize_parameter_value(&value.value.as_ref().expect("Value must exist"), context);
}

fn serialize_parameter_value(value: &ast::PropertyValue, context: &mut Context) {
    match value.get_inner() {
        ast::property_value::Inner::Num(value) => {
            context.add_buffer(format!("{}", value.value).as_str())
        }
        ast::property_value::Inner::Str(value) => {
            serialize_string(&value, context);
        }
        ast::property_value::Inner::Bool(value) => {
            serialize_boolean(&value, context);
        }
        ast::property_value::Inner::Parameters(value) => {
            serialize_parameters(&value, context);
        }
        ast::property_value::Inner::List(value) => {
            serialize_list(&value, context);
        }
    }
}
