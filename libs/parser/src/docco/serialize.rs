use super::ast;
use crate::base::ast as base_ast;
use paperclip_common::serialize_context::Context;

pub fn serialize(comment: &ast::Comment) -> String {
    let mut context = Context::new(0);
    serialize_comment(comment, &mut context);
    context.buffer
}

pub fn serialize_comment(comment: &ast::Comment, context: &mut Context) {
    context.add_buffer("/**");
    for item in &comment.body {
        match &item.value.as_ref().expect("Value must exist") {
            ast::comment_body_item::Value::Text(text) => serialize_text(text, context),
            ast::comment_body_item::Value::Property(property) => {
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
    match &prop
        .value
        .as_ref()
        .expect("value must exist")
        .value
        .as_ref()
        .expect("value must exist")
    {
        ast::property_value::Value::Str(value) => {
            context.add_buffer(" ");
            serialize_string(value, context);
        }
        ast::property_value::Value::Parameters(value) => {
            serialize_parameters(value, context);
        }
    }
}

fn serialize_string(value: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", value.value).as_str());
}

fn serialize_parameters(value: &ast::Parameters, context: &mut Context) {
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

fn serialize_parameter(value: &ast::Parameter, context: &mut Context) {
    context.add_buffer(format!("{}: ", value.name).as_str());
    match &value
        .value
        .as_ref()
        .expect("Value must exist")
        .value
        .as_ref()
        .expect("param value must exist")
    {
        ast::parameter_value::Value::Number(value) => {
            context.add_buffer(format!("{}", value.value).as_str())
        }
        ast::parameter_value::Value::Str(value) => {
            serialize_string(&value, context);
        }
    }
}
