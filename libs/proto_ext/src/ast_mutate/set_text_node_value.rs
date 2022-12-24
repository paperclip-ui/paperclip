use paperclip_proto::ast_mutate::{mutation_result, ExpressionUpdated, SetTextNodeValue};

use crate::ast::all::MutableVisitor;

use super::EditContext;

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetTextNodeValue> {
    fn visit_text_node(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::TextNode,
    ) -> crate::ast::all::VisitorResult<()> {
        if expr.id != self.mutation.text_node_id {
            return crate::ast::all::VisitorResult::Continue;
        }

        expr.value = self.mutation.value.to_string();

        self.changes.push(
            mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                id: expr.id.to_string(),
            })
            .get_outer(),
        );

        return crate::ast::all::VisitorResult::Return(());
    }
}
