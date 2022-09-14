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
        match item {
            ast::CommentBodyItem::Text(text) => serialize_text(text, context),
            ast::CommentBodyItem::Property(property) => serialize_property(property, context),
        }
    }
    context.add_buffer("*/");
}

fn serialize_text(text: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("{}", text.value).as_str());
}

fn serialize_property(prop: &ast::Property, context: &mut Context) {
    context.add_buffer(format!("@{}", prop.name).as_str());
    match &prop.value {
        ast::PropertyValue::String(value) => {
            context.add_buffer(" ");
            serialize_string(value, context);
        }
        ast::PropertyValue::Parameters(value) => {
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
    match &value.value {
        ast::ParameterValue::Number(value) => {
            context.add_buffer(format!("{}", value.value).as_str())
        }
        ast::ParameterValue::String(value) => {
            serialize_string(&value, context);
        }
    }
}
