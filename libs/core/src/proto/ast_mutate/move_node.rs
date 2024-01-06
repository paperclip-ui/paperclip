use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionDeleted};
use paperclip_proto::{
    ast::{
        pc::{document_body_item, node},
        wrapper::{Expression, ExpressionWrapper},
    },
    ast_mutate::MoveNode,
};

use super::utils::upsert_render_expr;
use super::EditContext;
use crate::proto::ast::duplicate::Duplicate;
use crate::try_remove_child;

#[macro_export]
macro_rules! move_child {
    ($self: expr, $expr: expr) => {{
        if let Some(_) = try_remove_child!($expr.body, &$self.mutation.node_id) {
            $self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: $self.mutation.node_id.to_string(),
                })
                .get_outer(),
            );
        }

        let target_pos = $expr
            .body
            .iter()
            .position(|x| x.get_id() == $self.mutation.target_id);

        let pos = if let Some(pos) = target_pos {
            pos as i32
        } else {
            -1
        };

        if ($expr.id == $self.mutation.target_id && $self.mutation.position == 2)
            || (pos > -1 && $self.mutation.position != 2)
        {
            let child = $self
                .expr_map
                .get_expr(&$self.mutation.node_id)
                .expect("Expr must exist");
            let node = match child {
                ExpressionWrapper::TextNode(child) => {
                    Some(node::Inner::Text(child.clone()).get_outer())
                }
                ExpressionWrapper::Element(child) => {
                    Some(node::Inner::Element(child.clone()).get_outer())
                }
                _ => None,
            };

            if let Some(child) = node {
                if $self.mutation.position == 2 {
                    $expr.body.push(child);
                } else if $self.mutation.position == 0 {
                    $expr.body.insert(pos as usize, child);
                } else if $self.mutation.position == 1 {
                    $expr
                        .body
                        .insert((pos + 1).try_into().expect("Can't increase pos"), child);
                }
            }
        }

        VisitorResult::Continue
    }};
}

impl MutableVisitor<()> for EditContext<MoveNode> {
    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_slot(
        &self,
        expr: &mut paperclip_proto::ast::pc::Slot,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_insert(
        &self,
        expr: &mut paperclip_proto::ast::pc::Insert,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        move_child!(self, expr)
    }
    fn visit_document(
        &self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        let mut doc_co = None;

        if let Some((i, _)) = try_remove_child!(expr.body, &self.mutation.node_id) {
            if i > 0 {
                if let Some(child) = expr.body.get(i - 1) {
                    match child.get_inner() {
                        document_body_item::Inner::DocComment(_) => {
                            doc_co = Some(child.clone());
                            expr.body.remove(i - 1);
                        }
                        _ => {}
                    }
                }
            }
            self.add_change(
                mutation_result::Inner::ExpressionDeleted(ExpressionDeleted {
                    id: self.mutation.node_id.to_string(),
                })
                .get_outer(),
            );
        }

        let target_pos = expr
            .body
            .iter()
            .position(|x| x.get_id() == self.mutation.target_id);

        let pos = if let Some(pos) = target_pos {
            pos as i32
        } else {
            -1
        };

        if (expr.id == self.mutation.target_id && self.mutation.position == 2)
            || (pos > -1 && self.mutation.position != 2)
        {
            let child = self
                .expr_map
                .get_expr(&self.mutation.node_id)
                .expect("Dep must exist");

            let node = match child {
                ExpressionWrapper::TextNode(child) => {
                    Some(document_body_item::Inner::Text(child.clone()).get_outer())
                }
                ExpressionWrapper::Element(child) => {
                    Some(document_body_item::Inner::Element(child.clone()).get_outer())
                }
                _ => None,
            };

            if let Some(child) = node {
                if self.mutation.position == 2 {
                    if let Some(doc_co) = doc_co {
                        expr.body.push(doc_co);
                    }
                    expr.body.push(child);
                } else if self.mutation.position == 0 {
                    let pos = {
                        let prev = if pos > 0 {
                            let pos: usize = (pos - 1).try_into().expect("Can't increase pos");
                            expr.body.get(pos)
                        } else {
                            None
                        };

                        // move BEFORE doc comment
                        if let Some(prev) = prev {
                            match prev.get_inner() {
                                document_body_item::Inner::DocComment(_) => pos as i32 - 1,
                                _ => pos as i32,
                            }
                        } else {
                            pos as i32
                        }
                    };

                    expr.body.insert(pos as usize, child);
                    if let Some(doc_co) = doc_co {
                        expr.body.insert(pos as usize, doc_co);
                    }
                } else if self.mutation.position == 1 {
                    let pos = (pos + 1).try_into().expect("Can't increase pos");

                    expr.body.insert(pos, child);

                    if let Some(doc_co) = doc_co {
                        expr.body.insert(pos, doc_co);
                    }
                }
            }
        }

        VisitorResult::Continue
    }

    fn visit_component(
        &self,
        expr: &mut paperclip_proto::ast::pc::Component,
    ) -> VisitorResult<(), EditContext<MoveNode>> {
        if self.mutation.target_id != expr.id {
            return VisitorResult::Continue;
        }

        if self.mutation.position != 2 {
            return VisitorResult::Continue;
        }

        let node = self
            .expr_map
            .get_expr(&self.mutation.node_id)
            .expect("Expr must exist");

        let node = match node {
            ExpressionWrapper::Element(node) => node::Inner::Element(node.clone()).get_outer(),
            ExpressionWrapper::TextNode(node) => node::Inner::Text(node.clone()).get_outer(),
            _ => return VisitorResult::Return(()),
        };

        let existing_render_node = upsert_render_expr(expr, false, &self);

        if let Some(render_node) = &mut existing_render_node.node {
            append_child(render_node, node);
        } else {
            existing_render_node.node = Some(node);
        }

        VisitorResult::Return(())
    }
}

fn append_child(node: &mut Node, child: Node) {
    match node.get_inner_mut() {
        node::Inner::Element(expr) => {
            expr.body.push(child.duplicate());
        }
        node::Inner::Text(expr) => {
            expr.body.push(child.duplicate());
        }
        _ => {}
    }
}
