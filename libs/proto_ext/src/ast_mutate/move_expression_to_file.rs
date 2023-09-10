use super::base::EditContext;
use paperclip_proto::{
    ast::css::FunctionCall,
    ast::pc::Element,
    ast::{
        all::ExpressionWrapper,
        graph_ext::Dependency,
        pc::{Document, Style},
    },
    ast_mutate::MoveExpressionToFile,
};

use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::get_expr::GetExpr;

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_dependency(&mut self, dep: &mut Dependency) -> VisitorResult<()> {
        let (expr, expr_dep) =
            GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
                .expect("Expr must exist");

        if let ExpressionWrapper::Component(component) = &expr {
            println!("COMPONENT!");
            let instances = dep.find_instances_of(&component.name, &expr_dep.path);
            println!("{:#?}", instances);
        }

        VisitorResult::Continue
    }
    // check for Instances
    fn visit_element(&mut self, _el: &mut Element) -> VisitorResult<()> {
        VisitorResult::Continue
    }

    fn visit_document(&mut self, _doc: &mut Document) -> VisitorResult<()> {
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
