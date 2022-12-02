use super::base::EditContext;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::css::StyleDeclaration;
use paperclip_proto::ast_mutate::{
    mutation_result, DeleteStyleDeclarations, ExpressionUpdated, MutationResult,
};

use crate::ast::{all::Visitor, all::VisitorResult};

impl<'expr> Visitor<Vec<MutationResult>> for EditContext<'expr, DeleteStyleDeclarations> {
    fn visit_style(&mut self, expr: &mut ast::pc::Style) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == self.mutation.expression_id {
            remove_declaration(expr, &self.mutation.declaration_names);
        }
        VisitorResult::Continue
    }

    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == &self.mutation.expression_id {
            for child in &mut expr.body {
                if let ast::pc::node::Inner::Style(style) = child.get_inner_mut() {
                    remove_declaration(style, &self.mutation.declaration_names);
                }
            }

            return VisitorResult::Return(vec![mutation_result::Inner::ExpressionUpdated(
                ExpressionUpdated {
                    id: expr.id.to_string(),
                },
            )
            .get_outer()]);
        }

        VisitorResult::Continue
    }
}

fn remove_declaration(style: &mut ast::pc::Style, name: &Vec<String>) {
    style.declarations = style
        .declarations
        .clone()
        .into_iter()
        .filter(|decl| !name.contains(&decl.name))
        .collect::<Vec<StyleDeclaration>>();
}
