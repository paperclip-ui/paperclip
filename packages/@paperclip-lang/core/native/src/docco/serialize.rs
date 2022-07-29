use super::ast;
use crate::core::serialize_context::Context;

pub fn serialize(comment: &ast::Comment) {
    let mut context = Context::new();
    serialize_comment(comment, &mut context);
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

fn serialize_text(text: &ast::Text, context: &mut Context) {
    context.add_buffer(format!("* {}", text.value.to_string()));
}

fn serialize_property(prop: &ast::Property, context: &mut Context) {
    context.add_buffer(format!("* @{}", prop.name));
    // match prop.value {
    //   ast::PropertyValue::Parameters(parameters) => serialize_parameters
    // }
}
