use super::base::EditContext;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::SetTagName;

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetTagName> {
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.element_id {
            expr.tag_name = self.mutation.tag_name.clone();
            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }
}
