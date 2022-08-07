use super::ast;
use crate::base::ast as base_ast;
use crate::core::serialize_context::Context;
use crate::docco::ast as docco_ast;
use crate::docco::serialize::serialize_comment as serialize_doc_comment;

pub fn serialize_declarations(declarations: &Vec<ast::StyleDeclaration>, depth: u8) -> String {
    let mut context = Context::new(0);
    for decl in declarations {
        serialize_declaration(decl, &mut context);
    }
    context.buffer
}

fn serialize_declaration(style: &ast::StyleDeclaration, context: &mut Context) {
    context.add_buffer(format!("{}: {}\n", style.name, style.value));
}
