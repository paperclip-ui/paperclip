use super::ast;
use crate::base::ast as base_ast;
use crate::core::serialize_context::Context;
use crate::docco::ast as docco_ast;
use crate::docco::serialize::serialize_comment as serialize_doc_comment;

pub fn serialize_declarations(declarations: &Vec<ast::StyleDeclaration>, depth: u8) -> String {
    let mut context = Context::new(depth);
    context.add_buffer("{\n".to_string());
    context.start_block();
    for decl in declarations {
        serialize_declaration(decl, &mut context);
    }
    context.end_block();
    context.add_buffer("}\n".to_string());
    context.buffer
}

fn serialize_declaration(style: &ast::StyleDeclaration, context: &mut Context) {
    context.add_buffer(format!("{}: ", style.name));
    serialize_decl_value(&style.value, context);
    context.add_buffer("\n".to_string());
}

pub fn serialize_decl_value(value: &ast::DeclarationValue, context: &mut Context) {
    match value {
        ast::DeclarationValue::Reference(reference) => {
            context.add_buffer(reference.path.join("."));
        }
        ast::DeclarationValue::Measurement(measurement) => {
            context.add_buffer(format!("{}{}", measurement.value, measurement.unit))
        }
        ast::DeclarationValue::Number(number) => {
            context.add_buffer(format!("{}", number.value));
        }
        ast::DeclarationValue::FunctionCall(call) => {
            context.add_buffer(format!("{}(", call.name));
            // context.add_buffer(format!("{}", call.name));
            serialize_decl_value(&call.arguments, context);
            context.add_buffer(")".to_string());
        }
        ast::DeclarationValue::String(value) => {
            context.add_buffer(format!("\"{}\"", value.value));
        }
        ast::DeclarationValue::SpacedList(list) => {
            let mut it = list.items.iter().peekable();
            while let Some(item) = it.next() {
                serialize_decl_value(&item, context);
                if it.peek().is_some() {
                    context.add_buffer(" ".to_string());
                }
            }
        }
        ast::DeclarationValue::CommaList(list) => {
            let mut it = list.items.iter().peekable();
            while let Some(item) = it.next() {
                serialize_decl_value(&item, context);
                if it.peek().is_some() {
                    context.add_buffer(", ".to_string());
                }
            }
        }
        ast::DeclarationValue::Arithmetic(arithmetic) => {
            serialize_decl_value(&arithmetic.left, context);
            context.add_buffer(format!(" {} ", arithmetic.operator));
            serialize_decl_value(&arithmetic.right, context);
        }
        ast::DeclarationValue::HexColor(color) => {
            context.add_buffer(format!("#{}", color.value));
        }
        ast::DeclarationValue::Keyword(keyword) => {
            context.add_buffer(format!("{}", keyword.path.join(".")));
        }
    }
}
