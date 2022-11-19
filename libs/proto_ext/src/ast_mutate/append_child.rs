use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{
    mutation_result, AppendChild, ExpressionInserted, MutationResult,
};

use crate::ast::{all::Visitor, all::VisitorResult};

impl Visitor<Vec<MutationResult>> for AppendChild {
    fn visit_document(
        &mut self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == &self.parent_id {
            expr.body.push(
                self.child
                    .clone()
                    .expect("Child must exist")
                    .try_into()
                    .unwrap(),
            );
            return VisitorResult::Return(vec![mutation_result::Inner::ExpressionInserted(
                ExpressionInserted {
                    id: self.child.clone().unwrap().get_id().to_string(),
                },
            )
            .get_outer()]);
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == &self.parent_id {
            expr.body
                .push(self.child.clone().expect("Child must exist"));
        }
        VisitorResult::Continue
    }
}
