use super::base::EditContext;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{mutation_result, DeleteExpression, ExpressionDeleted};

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;
macro_rules! try_remove_child {
    ($children:expr, $id: expr) => {{
        let mut found_i = None;

        for (i, item) in $children.iter().enumerate() {
            if item.get_id() == $id {
                found_i = Some(i);
            }
        }

        if let Some(i) = found_i {
            $children.remove(i);
            Some(i)
        } else {
            None
        }
    }};
}

impl<'expr> MutableVisitor<()> for EditContext<'expr, DeleteExpression> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if let Some(i) = try_remove_child!(expr.body, &self.mutation.expression_id) {
            let prev_index = i - 1;
            let mut results = vec![
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            ];
            if prev_index >= 0 {
                if let Some(child) = expr.body.get(prev_index) {
                    if matches!(
                        child.get_inner(),
                        ast::pc::document_body_item::Inner::DocComment(_)
                    ) {
                        results.push(
                            mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                                id: child.get_id().to_string(),
                            })
                            .get_outer(),
                        );
                        expr.body.remove(prev_index);
                    }
                }
            }

            self.changes.extend(results);
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.changes.push(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
    fn visit_slot(&mut self, expr: &mut ast::pc::Slot) -> VisitorResult<()> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.changes.push(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult<()> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.changes.push(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }

        VisitorResult::Continue
    }
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
        let target_id = if let Some(render_node) = expr.get_render_expr() {
            if render_node.node.as_ref().expect("node must exist").get_id()
                == self.mutation.expression_id
            {
                render_node.id.to_string()
            } else {
                self.mutation.expression_id.to_string()
            }
        } else {
            self.mutation.expression_id.to_string()
        };

        if matches!(try_remove_child!(expr.body, &target_id), Some(_)) {
            self.changes.push(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }

        VisitorResult::Continue
    }
}
