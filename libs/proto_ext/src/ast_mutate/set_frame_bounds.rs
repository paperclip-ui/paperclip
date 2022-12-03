use super::base::EditContext;
use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{mutation_result, ExpressionUpdated, SetFrameBounds};
use paperclip_proto::{ast, ast_mutate::MutationResult};

use crate::ast::{all::Visitor, all::VisitorResult};

impl<'expr> Visitor<Vec<MutationResult>> for EditContext<'expr, SetFrameBounds> {
    fn visit_document(
        &mut self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<Vec<MutationResult>> {
        if let Some(frame_index) = expr.body.iter().position(|expr| {
            expr.get_inner().get_id() == &self.mutation.frame_id
                || is_expr_render_node(&self.mutation.frame_id, expr)
        }) {
            let bounds = self.mutation.bounds.as_ref().unwrap();

            let mut results = vec![];

            let new_comment = parse_comment(
                format!(
                    "/**\n * @bounds(x: {}, y: {}, width: {}, height: {})\n*/",
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
                    } else {
                        results.push(
                            mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                                id: new_comment.id.to_string(),
                            })
                            .get_outer(),
                        );
                        expr.body.insert(
                            frame_index,
                            ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer(),
                        );
                    }
                }
            } else {
                expr.body.insert(
                    0,
                    ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer(),
                );
            }

            return VisitorResult::Return(results);
        }

        VisitorResult::Continue
    }
}

fn is_expr_render_node(id: &str, doc_body_item: &ast::pc::DocumentBodyItem) -> bool {
    if let ast::pc::document_body_item::Inner::Component(component) = doc_body_item.get_inner() {
        if let Some(render) = component.get_render_expr() {
            return render.node.as_ref().expect("Node must exist").get_id() == id;
        }
    }

    false
}
