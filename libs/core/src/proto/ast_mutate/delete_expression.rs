use super::base::EditContext;
use crate::try_remove_child;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{mutation_result, DeleteExpression, ExpressionDeleted};

impl MutableVisitor<()> for EditContext<DeleteExpression> {
    fn visit_document(
        &self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
        if let Some((i, _)) = try_remove_child!(expr.body, &self.mutation.expression_id) {
            let prev_index: i32 = (i as i32) - 1;
            let mut results = vec![
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            ];
            if prev_index >= 0 {
                if let Some(child) = expr.body.get(prev_index as usize) {
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
                        expr.body.remove(prev_index as usize);
                    }
                }
            }

            self.add_changes(results);
        }
        VisitorResult::Continue
    }
    fn visit_element(
        &self,
        expr: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
            return VisitorResult::Return(());
        }

        // let mut rm_i = None;

        // for (i, child) in &mut expr.body.iter_mut().enumerate() {
        //     if let ast::pc::node::Inner::Insert(ins) = child.get_inner_mut() {
        //         if matches!(
        //             try_remove_child!(ins.body, &self.mutation.expression_id),
        //             Some(_)
        //         ) {
        //             self.add_change(
        //                 mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
        //                     id: self.mutation.expression_id.to_string(),
        //                 })
        //                 .get_outer(),
        //             );
        //         }

        //         if ins.body.len() == 0 {
        //             rm_i = Some(i);
        //         }
        //     }
        // }
        // if let Some(i) = rm_i {
        //     expr.body.remove(i);
        //     self.add_change(
        //         mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
        //             id: self.mutation.expression_id.to_string(),
        //         })
        //         .get_outer(),
        //     );
        // }
        VisitorResult::Continue
    }
    fn visit_slot(
        &self,
        expr: &mut ast::pc::Slot,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
    fn visit_insert(
        &self,
        expr: &mut ast::pc::Insert,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
            return VisitorResult::Return(());
        }

        VisitorResult::Continue
    }
    fn visit_text_node(
        &self,
        expr: &mut ast::pc::TextNode,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
        if matches!(
            try_remove_child!(expr.body, &self.mutation.expression_id),
            Some(_)
        ) {
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }

        VisitorResult::Continue
    }
    fn visit_component(
        &self,
        expr: &mut ast::pc::Component,
    ) -> VisitorResult<(), EditContext<DeleteExpression>> {
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
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.expression_id.to_string(),
                })
                .get_outer(),
            );
        }

        VisitorResult::Continue
    }
}
