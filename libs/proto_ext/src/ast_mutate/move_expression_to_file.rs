use crate::ast_mutate::utils::resolve_import_ns;

use super::{base::EditContext, utils::import_dep};
use paperclip_common::get_or_short;
use paperclip_proto::{
    ast::css::FunctionCall,
    ast::pc::Element,
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, Document, Style},
    },
    ast_mutate::MoveExpressionToFile,
};

use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::get_expr::GetExpr;

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_document(&mut self, doc: &mut Document) -> VisitorResult<()> {
        let (expr, expr_dep) =
            GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
                .expect("Dep must exist");

        if self.mutation.new_file_path == self.get_dependency().path {
            let body_item = match expr {
                ExpressionWrapper::Component(expr) => {
                    Some(document_body_item::Inner::Component(expr.clone()).get_outer())
                }
                // ExpressionWrapper::Style(expr) => {

                // },
                // ExpressionWrapper::TextNode(expr) => {

                // },
                // ExpressionWrapper::Element(expr) => {

                // },
                // ExpressionWrapper::Atom(expr) => {
                //     Some(document_body_item::Inner::Atom(expr.clone()).get_outer())
                // },
                _ => None,
            };

            if let Some(item) = body_item {
                doc.body.push(item);
            }
            VisitorResult::Continue
        } else if expr_dep.path == self.get_dependency().path {
            let i = doc
                .body
                .iter()
                .position(|item| item.get_id() == expr.get_id());
            if let Some(i) = i {
                doc.body.remove(i);
            }
            VisitorResult::Continue
        } else {
            let resolved = self
                .get_dependency()
                .imports
                .iter()
                .find(|(_key, value)| value == &&expr_dep.path);

            if resolved.is_none() {
                return VisitorResult::Continue;
            }

            import_dep(doc, &self.mutation.new_file_path, self);

            VisitorResult::Continue
        }
    }
    // check for Instances
    fn visit_element(&mut self, el: &mut Element) -> VisitorResult<()> {
        let ns = get_or_short!(&el.namespace, VisitorResult::Continue);
        let el_dep = self
            .get_dependency()
            .resolve_import_from_ns(&ns, &self.graph)
            .expect("Import must exist");

        let (expr, expr_dep) =
            GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
                .expect("Component must exist");

        if let ExpressionWrapper::Component(component) = expr {
            if component.name == el.tag_name && el_dep.path == expr_dep.path {
                let (new_ns, _) =
                    resolve_import_ns(&self.get_dependency(), &self.mutation.new_file_path);
                el.namespace = Some(new_ns);
            }
        }

        VisitorResult::Continue
    }

    fn visit_style(&mut self, style: &mut Style) -> VisitorResult<()> {
        for extends in &style.extends {}

        VisitorResult::Continue
    }

    // check for tokens
    fn visit_css_function_call(&mut self, _expr: &mut Box<FunctionCall>) -> VisitorResult<()> {
        VisitorResult::Continue
    }
}
