use paperclip_proto::ast::all::Expression;
use paperclip_proto::{
    ast,
    ast_mutate::{mutation_result, ExpressionInserted, InsertFrame, MutationResult},
};

use crate::ast::{all::Visitor, all::VisitorResult};
use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_parser::pc::parser::parse as parse_pc;

impl Visitor<Vec<MutationResult>> for InsertFrame {
    fn visit_document(
        &mut self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<Vec<MutationResult>> {
        if expr.id == self.document_id {
            let bounds = self.bounds.as_ref().unwrap();

            let mut mutations = vec![];
            let checksum = expr.checksum();

            let new_comment = parse_comment(
                format!(
                    "/**\n * @bounds(x: {}, y: {}, width: {}, height: {})\n*/",
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                .trim(),
                &checksum,
            )
            .unwrap();

            let to_insert = parse_pc(&self.node_source, &checksum).unwrap();

            mutations.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: new_comment.id.to_string(),
                })
                .get_outer(),
            );

            expr.body
                .push(ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer());

            for node in to_insert.body {
                mutations.push(
                    mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                        id: node.clone().get_id().to_string(),
                    })
                    .get_outer(),
                );
                expr.body.push(node.clone());
            }

            return VisitorResult::Return(mutations);
        }

        VisitorResult::Continue
    }
}
