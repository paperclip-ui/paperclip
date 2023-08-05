use paperclip_proto::ast_mutate::{mutation_result, DeleteExpression, ExpressionDeleted};
use paperclip_proto::{
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{node, Document, Node, Slot, document_body_item},
    },
    ast_mutate::MoveNode,
};

use super::{utils::get_named_expr_id, EditContext};
use crate::{
    ast::{
        all::{MutableVisitor, VisitorResult},
        get_expr::{get_expr_dep, GetExpr},
    },
    replace_child, try_remove_child
};

macro_rules! try_move_child {
    ($self: expr, $expr:expr, $wrap: path) => {{
        if matches!(
            try_remove_child!($expr.body, &$self.mutation.node_id),
            Some(_)
        ) {
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
                    Some(<$wrap>::Text(child.clone()).get_outer())
                }
                ExpressionWrapper::Element(child) => {
                    Some(<$wrap>::Element(child.clone()).get_outer())
                }
                _ => None,
            };

            if let Some(child) = node {
                if $self.mutation.position == 2 {
                    $expr.body.push(child);
                } else if $self.mutation.position == 0 {
                    $expr.body.insert(pos as usize, child);
                } else if $self.mutation.position == 1 {
                    $expr.body
                        .insert((pos + 1).try_into().expect("Can't increase pos"), child);
                }
            }
        }

        VisitorResult::Continue
    }};
}

impl<'a> MutableVisitor<()> for EditContext<'a, MoveNode> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        try_move_child!(self, expr, node::Inner)
        
    }
    fn visit_document(&mut self,expr: &mut paperclip_proto::ast::pc::Document) -> VisitorResult<()> {
        try_move_child!(self, expr, document_body_item::Inner)
    }
}
