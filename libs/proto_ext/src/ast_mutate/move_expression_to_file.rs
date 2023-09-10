use super::base::EditContext;
use paperclip_proto::{ast::pc::Element, ast_mutate::MoveExpressionToFile};

use crate::ast::all::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_element(&mut self, el: &mut Element) -> VisitorResult<()> {
        VisitorResult::Continue
    }
}
