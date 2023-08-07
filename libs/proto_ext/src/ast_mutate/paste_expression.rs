use paperclip_proto::ast_mutate::{PasteExpression};
use paperclip_proto::{
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, node},
    },
    ast_mutate::MoveNode,
};

use super::EditContext;
use crate::{
    ast::{
        all::{MutableVisitor, VisitorResult},
    },
    try_remove_child,
};

impl<'a> MutableVisitor<()> for EditContext<'a, PasteExpression> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {

        if self.mutation.target_expression_id != expr.id {
            return VisitorResult::Continue;
        }
        println!("VISIT EL {:?}", self.mutation);
        

        VisitorResult::Return(())
    }
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
        if self.mutation.target_expression_id != expr.id {
            return VisitorResult::Continue;
        }

        VisitorResult::Return(())
    }
}
