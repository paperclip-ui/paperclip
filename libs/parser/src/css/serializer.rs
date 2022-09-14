use super::ast;
use paperclip_common::serialize_context::Context;

pub fn serialize_declarations(declarations: &Vec<ast::StyleDeclaration>, depth: u8) -> String {
    let mut context = Context::new(depth);
    context.add_buffer("{\n");
    context.start_block();
    for decl in declarations {
        serialize_declaration(decl, &mut context);
    }
    context.end_block();
    context.add_buffer("}\n");
    context.buffer
}

fn serialize_declaration(style: &ast::StyleDeclaration, context: &mut Context) {
    context.add_buffer(format!("{}: ", style.name).as_str());
    serialize_decl_value(&style.value, context);
    context.add_buffer("\n");
}

pub fn serialize_decl_value(value: &ast::DeclarationValue, context: &mut Context) {
    match value {
        ast::DeclarationValue::Reference(reference) => {
            context.add_buffer(reference.path.join(".").as_str());
        }
        ast::DeclarationValue::Measurement(measurement) => {
            context.add_buffer(format!("{}{}", measurement.value, measurement.unit).as_str())
        }
        ast::DeclarationValue::Number(number) => {
            context.add_buffer(format!("{}", number.value).as_str());
        }
        ast::DeclarationValue::FunctionCall(call) => {
            context.add_buffer(format!("{}(", call.name).as_str());
            // context.add_buffer(format!("{}", call.name));
            serialize_decl_value(&call.arguments, context);
            context.add_buffer(")");
        }
        ast::DeclarationValue::String(value) => {
            context.add_buffer(format!("\"{}\"", value.value).as_str());
        }
        ast::DeclarationValue::SpacedList(list) => {
            let mut it = list.items.iter().peekable();
            while let Some(item) = it.next() {
                serialize_decl_value(&item, context);
                if it.peek().is_some() {
                    context.add_buffer(" ");
                }
            }
        }
        ast::DeclarationValue::CommaList(list) => {
            let mut it = list.items.iter().peekable();
            while let Some(item) = it.next() {
                serialize_decl_value(&item, context);
                if it.peek().is_some() {
                    context.add_buffer(", ");
                }
            }
        }
        ast::DeclarationValue::Arithmetic(arithmetic) => {
            serialize_decl_value(&arithmetic.left, context);
            context.add_buffer(format!(" {} ", arithmetic.operator).as_str());
            serialize_decl_value(&arithmetic.right, context);
        }
        ast::DeclarationValue::HexColor(color) => {
            context.add_buffer(format!("#{}", color.value).as_str());
        }
    }
}
