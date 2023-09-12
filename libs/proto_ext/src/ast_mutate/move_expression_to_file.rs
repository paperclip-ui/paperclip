use crate::ast_mutate::utils::resolve_import_ns;

use super::base::EditContext;
use paperclip_common::get_or_short;
use paperclip_proto::{
    ast::css,
    ast::pc::Element,
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, Document},
        shared::Reference,
    },
    ast_mutate::{mutation, AddImport, MoveExpressionToFile},
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
                ExpressionWrapper::Style(expr) => {
                    Some(document_body_item::Inner::Style(expr.clone()).get_outer())
                }
                ExpressionWrapper::TextNode(expr) => {
                    Some(document_body_item::Inner::Text(expr.clone()).get_outer())
                }
                ExpressionWrapper::Element(expr) => {
                    Some(document_body_item::Inner::Element(expr.clone()).get_outer())
                }
                ExpressionWrapper::Atom(expr) => {
                    Some(document_body_item::Inner::Atom(expr.clone()).get_outer())
                }
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
                el.namespace = Some(new_ns.clone());

                self.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: new_ns.clone(),
                        path: self.mutation.new_file_path.clone(),
                    })
                    .get_outer(),
                );
            }
        }

        VisitorResult::Continue
    }

    fn visit_reference(&mut self, reference: &mut Reference) -> VisitorResult<()> {
        if let Some((expr, _dep)) = reference.follow(&self.graph) {
            if expr.get_id() == &self.mutation.expression_id {
                let (ns, _) =
                    resolve_import_ns(self.get_dependency(), &self.mutation.new_file_path);

                self.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: ns.clone(),
                        path: self.mutation.new_file_path.clone(),
                    })
                    .get_outer(),
                );

                if reference.path.len() == 2 {
                    let _ = std::mem::replace(&mut reference.path[0], ns);
                } else if reference.path.len() == 1 {
                    reference.path.insert(0, ns);
                }
            }
        }
        VisitorResult::Continue
    }

    // check for tokens
    fn visit_css_function_call(&mut self, _expr: &mut Box<css::FunctionCall>) -> VisitorResult<()> {
        VisitorResult::Continue
    }
}
