use paperclip_proto::ast::all::Expression;
use paperclip_proto::{
    ast,
    ast_mutate::{mutation_result, ExpressionInserted, InsertFrame, MutationResult},
};

use crate::ast::{all::Visitor, all::VisitorResult};
use paperclip_parser::docco::parser::parse as parse_comment;
extern crate time;

impl Visitor<Vec<MutationResult>> for InsertFrame {
    fn visit_document(
        &mut self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<Vec<MutationResult>> {
        if expr.id == self.document_id {
            let bounds = self.bounds.as_ref().unwrap();

            let mut mutations = vec![];

            let new_comment = parse_comment(
                format!(
                    "/**\n * @bounds(x: {}, y: {}, width: {}, height: {})\n*/",
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                .trim(),
                format!("{}", time::OffsetDateTime::now_utc()).as_str(),
            )
            .unwrap();

            mutations.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: new_comment.id.to_string(),
                })
                .get_outer(),
            );

            expr.body
                .push(ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer());

            mutations.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: self.node.clone().unwrap().get_id().to_string(),
                })
                .get_outer(),
            );
            expr.body
                .push(self.node.clone().unwrap().try_into().unwrap());

            return VisitorResult::Return(mutations);
        }

        VisitorResult::Continue
    }
}
