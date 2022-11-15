use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::SetFrameBounds;

use crate::ast::{all::Visitor, all::VisitorResult};

impl Visitor for SetFrameBounds {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
        if let Some(frame_index) = expr
            .body
            .iter()
            .position(|expr| expr.get_inner().get_id() == &self.frame_id)
        {
            let bounds = self.bounds.as_ref().unwrap();

            let new_comment = parse_comment(
                format!(
                    r#"
                /**
                 * @bounds(x: {}, y: {}, width: {}, height: {})
                 */
            "#,
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                .trim(),
                "none",
            )
            .unwrap();

            if frame_index > 0 {
                if let Some(item) = expr.body.get_mut(frame_index - 1) {
                    if let ast::pc::document_body_item::Inner::DocComment(comment) =
                        item.get_inner_mut()
                    {
                        std::mem::replace(comment, new_comment);
                    }
                }
            } else {
                expr.body.insert(
                    0,
                    ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer(),
                );
            }

            return VisitorResult::Stop;
        }

        VisitorResult::Continue
    }
}
