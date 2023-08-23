use super::base::EditContext;
use super::utils::{import_dep, resolve_import_ns, upsert_render_node};
use paperclip_common::get_or_short;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::node;
use paperclip_proto::ast_mutate::SetTagName;

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;
use crate::ast::get_expr::GetExpr;

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetTagName> {
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.element_id {
            let namespace = if let Some(file_path) = &self.mutation.tag_file_path {
                if file_path != &self.get_dependency().path {
                    Some(resolve_import_ns(&self.get_dependency(), &file_path).0)
                } else {
                    None
                }
            } else {
                None
            };

            expr.tag_name = self.mutation.tag_name.clone();
            expr.namespace = namespace;
            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }
    fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult<()> {
        let expr = GetExpr::get_expr(&self.mutation.element_id, document);
        if expr.is_none() {
            return VisitorResult::Continue;
        }

        let imp = get_or_short!(&self.mutation.tag_file_path, VisitorResult::Continue);

        if imp == &self.get_dependency().path {
            return VisitorResult::Continue;
        }

        import_dep(document, &self.get_dependency(), imp);

        VisitorResult::Continue
    }
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
        if expr.get_id() != &self.mutation.element_id {
            return VisitorResult::Continue;
        }
        let render_node = upsert_render_node(expr, false);
        if let Some(node) = &mut render_node.node {
            if let node::Inner::Element(element) = node.get_inner_mut() {
                element.tag_name = self.mutation.tag_name.clone();
            }
        } else {
            render_node.node = Some(
                node::Inner::Element(ast::pc::Element {
                    tag_name: self.mutation.tag_name.clone(),
                    ..Default::default()
                })
                .get_outer(),
            );
        }
        VisitorResult::Return(())
    }
}
