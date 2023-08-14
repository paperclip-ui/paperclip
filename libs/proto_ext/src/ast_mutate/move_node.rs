use paperclip_proto::ast::pc::{component_body_item, Render, Node};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionDeleted};
use paperclip_proto::{
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, node},
    },
    ast_mutate::MoveNode,
};

use super::EditContext;
use crate::ast::get_expr::GetExpr;
use crate::{
    ast::{
        all::{MutableVisitor, VisitorResult},
        get_expr::get_expr_dep,
    },
    try_remove_child,
};

#[macro_export]
macro_rules! move_child {
    ($self: expr, $expr: expr) => {{
        if let Some(_) = try_remove_child!($expr.body, &$self.mutation.node_id) {
            $self.changes.push(
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
            let (child, _) =
                get_expr_dep(&$self.mutation.node_id, &$self.graph).expect("Dep must exist");
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

impl<'a> MutableVisitor<()> for EditContext<'a, MoveNode> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        move_child!(self, expr)
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        move_child!(self, expr)
    }
    fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        move_child!(self, expr)
    }
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
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
            self.changes.push(
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
            let (child, _) =
                get_expr_dep(&self.mutation.node_id, &self.graph).expect("Dep must exist");

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
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Component,
    ) -> VisitorResult<()> {
        if self.mutation.target_id != expr.id {
            return VisitorResult::Continue;
        }

        if self.mutation.position != 2 {
            return VisitorResult::Continue;
        }

        let node = GetExpr::get_expr_from_graph(&self.mutation.node_id, &self.graph)
            .expect("Node must exist")
            .0;

        let node = match node {
            ExpressionWrapper::Element(node) => node::Inner::Element(node).get_outer(),
            ExpressionWrapper::TextNode(node) => node::Inner::Text(node).get_outer(),
            _ => return VisitorResult::Return(()),
        };

        let existing_render_node = expr.body.iter_mut().find(|x| match x.get_inner() {
            component_body_item::Inner::Render(_) => true,
            _ => false,
        });



        if existing_render_node.is_some() {
            let existing_render_node: &mut Render = existing_render_node.unwrap().try_into().expect("Must be render node");
            append_child(existing_render_node.node.as_mut().expect("Node must exist"), node);
        } else {
            expr.body.push(
                component_body_item::Inner::Render(Render {
                    id: self
                        .get_dependency()
                        .document
                        .as_ref()
                        .expect("Doc must exist")
                        .checksum(),
                    range: None,
                    node: Some(node),
                })
                .get_outer(),
            );
        }

        VisitorResult::Return(())
    }
}


fn append_child(node: &mut Node, child: Node) {
    match node.get_inner_mut() {
        node::Inner::Element(expr)  => {
            expr.body.push(child);
        },
        node::Inner::Text(expr)  => {
            expr.body.push(child);
        },
        _ => {

        }
    }
}