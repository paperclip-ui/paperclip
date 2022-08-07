use super::ast;
use crate::base::ast as base_ast;
use crate::core::serialize_context::Context;

pub fn serialize(comment: &ast::Comment) -> String {
    let mut context = Context::new();
    serialize_comment(comment, &mut context);
    context.buffer
}

pub fn serialize_comment(comment: &ast::Comment, context: &mut Context) {
    context.add_buffer("/**".to_string());
    for item in &comment.body {
        match item {
            ast::CommentBodyItem::Text(text) => serialize_text(text, context),
            ast::CommentBodyItem::Property(property) => serialize_property(property, context),
        }
    }
    context.add_buffer("*/".to_string());
}

fn serialize_text(text: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("{}", text.value.to_string()));
}

fn serialize_property(prop: &ast::Property, context: &mut Context) {
    context.add_buffer(format!("@{}", prop.name));
    match &prop.value {
        ast::PropertyValue::String(value) => {
            context.add_buffer(" ".to_string());
            serialize_string(value, context);
        }
        ast::PropertyValue::Parameters(value) => {
            serialize_parameters(value, context);
        }
        _ => {}
    }
}

fn serialize_string(value: &base_ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", value.value));
}

fn serialize_parameters(value: &ast::Parameters, context: &mut Context) {
    context.add_buffer("(".to_string());
    let mut it = (&value.items).into_iter().peekable();
    while let Some(param) = it.next() {
        serialize_parameter(param, context);
        if it.peek().is_some() {
            context.add_buffer(", ".to_string());
        }
    }

    context.add_buffer(")".to_string());
}

fn serialize_parameter(value: &ast::Parameter, context: &mut Context) {
    context.add_buffer(format!("{}: ", value.name));
    match &value.value {
        ast::ParameterValue::Number(value) => context.add_buffer(format!("{}", value.value)),
        ast::ParameterValue::String(value) => {
            serialize_string(&value, context);
        }
    }
}
