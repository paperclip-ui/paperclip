use paperclip_proto::{ast, ast_mutate::InsertFrame};

use crate::ast::{all::Visitor, all::VisitorResult};
use paperclip_parser::docco::parser::parse as parse_comment;

impl Visitor for InsertFrame {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
        if expr.id == self.document_id {
            let bounds = self.bounds.as_ref().unwrap();

            let new_comment = parse_comment(
                format!(
                    "/**\n * @bounds(x: {}, y: {}, width: {}, height: {})\n*/",
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                .trim(),
                "none",
            )
            .unwrap();

            expr.body.push(ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer());
            expr.body.push(self.node.clone().unwrap().try_into().unwrap());

            return VisitorResult::Stop;
        }

        VisitorResult::Continue
    }
}
