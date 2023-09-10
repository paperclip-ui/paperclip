use super::base::EditContext;
use paperclip_proto::{
    ast::css::FunctionCall,
    ast::pc::Element,
    ast::{
        all::ExpressionWrapper,
        pc::{Document, Style},
    },
    ast_mutate::MoveExpressionToFile,
};

use crate::ast::get_expr::GetExpr;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    // check for Instances
    fn visit_element(&mut self, _el: &mut Element) -> VisitorResult<()> {
        VisitorResult::Continue
    }

    fn visit_document(&mut self, _doc: &mut Document) -> VisitorResult<()> {
        let (expr, dep) = GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
            .expect("Expr must exist");

        if let ExpressionWrapper::Component(component) = &expr {}

        VisitorResult::Continue
    }

    // check for tokens
    fn visit_css_function_call(&mut self, _expr: &mut Box<FunctionCall>) -> VisitorResult<()> {
        VisitorResult::Continue
    }

    // check for extends
    fn visit_style(&mut self, _expr: &mut Style) -> VisitorResult<()> {
        VisitorResult::Continue
    }
}
