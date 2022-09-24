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
    if let Some(value) = &style.value {
        serialize_decl_value(value, context);
    }
    context.add_buffer("\n");
}

pub fn serialize_decl_value(value: &ast::DeclarationValue, context: &mut Context) {
    if let Some(value) = &value.inner {
        match &value {
            ast::declaration_value::Inner::Reference(reference) => {
                context.add_buffer(reference.path.join(".").as_str());
            }
            ast::declaration_value::Inner::Measurement(measurement) => {
                context.add_buffer(format!("{}{}", measurement.value, measurement.unit).as_str())
            }
            ast::declaration_value::Inner::Number(number) => {
                context.add_buffer(format!("{}", number.value).as_str());
            }
            ast::declaration_value::Inner::FunctionCall(call) => {
                context.add_buffer(format!("{}(", call.name).as_str());
                // context.add_buffer(format!("{}", call.name));
                if let Some(arguments) = &call.arguments {
                    serialize_decl_value(arguments, context);
                }
                context.add_buffer(")");
            }
            ast::declaration_value::Inner::Str(value) => {
                context.add_buffer(format!("\"{}\"", value.value).as_str());
            }
            ast::declaration_value::Inner::SpacedList(list) => {
                let mut it = list.items.iter().peekable();
                while let Some(item) = it.next() {
                    serialize_decl_value(&item, context);
                    if it.peek().is_some() {
                        context.add_buffer(" ");
                    }
                }
            }
            ast::declaration_value::Inner::CommaList(list) => {
                let mut it = list.items.iter().peekable();
                while let Some(item) = it.next() {
                    serialize_decl_value(&item, context);
                    if it.peek().is_some() {
                        context.add_buffer(", ");
                    }
                }
            }
            ast::declaration_value::Inner::Arithmetic(arithmetic) => {
                if let Some(left) = &arithmetic.left {
                    serialize_decl_value(left, context);
                }
                context.add_buffer(format!(" {} ", arithmetic.operator).as_str());
                if let Some(right) = &arithmetic.right {
                    serialize_decl_value(right.as_ref(), context);
                }
            }
            ast::declaration_value::Inner::HexColor(color) => {
                context.add_buffer(format!("#{}", color.value).as_str());
            }
        }
    }
}
