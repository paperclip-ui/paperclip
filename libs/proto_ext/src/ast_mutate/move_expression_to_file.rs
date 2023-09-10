use super::base::EditContext;
use paperclip_proto::{
    ast::css::FunctionCall, ast::pc::Element, ast::pc::Style, ast_mutate::MoveExpressionToFile,
};

use crate::ast::all::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    // check for Instances
    fn visit_element(&mut self, el: &mut Element) -> VisitorResult<()> {
        VisitorResult::Continue
    }

    // check for tokens
    fn visit_css_function_call(&mut self, expr: &mut Box<FunctionCall>) -> VisitorResult<()> {
        VisitorResult::Continue
    }

    // check for extends
    fn visit_style(&mut self, expr: &mut Style) -> VisitorResult<()> {
        VisitorResult::Continue
    }
}
