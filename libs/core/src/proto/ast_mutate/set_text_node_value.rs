use paperclip_proto::{
    ast::all::visit::{MutableVisitor, VisitorResult},
    ast_mutate::{mutation_result, ExpressionUpdated, SetTextNodeValue},
};

use super::EditContext;

impl MutableVisitor<()> for EditContext<SetTextNodeValue> {
    fn visit_text_node(
        &self,
        expr: &mut paperclip_proto::ast::pc::TextNode,
    ) -> VisitorResult<(), Self> {
        if expr.id != self.mutation.text_node_id {
            return VisitorResult::Continue;
        }

        expr.value = self.mutation.value.to_string();

        self.add_change(
            mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                id: expr.id.to_string(),
            })
            .get_outer(),
        );

        return VisitorResult::Return(());
    }
}
