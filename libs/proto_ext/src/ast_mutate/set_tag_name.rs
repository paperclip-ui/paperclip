use super::base::EditContext;
use super::utils::{get_instance_component, import_dep, resolve_import_ns, upsert_render_expr};
use paperclip_common::get_or_short;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::node;
use paperclip_proto::ast_mutate::SetTagName;

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;
use crate::ast::get_expr::GetExpr;
use crate::ast::pc::FindSlotNames;

impl MutableVisitor<()> for EditContext<SetTagName> {
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

            let inst_component = get_instance_component(
                &self.mutation.tag_name,
                namespace.clone(),
                &self.get_dependency(),
                &self.graph,
            );
            let slot_names = if let Some(component) = inst_component {
                FindSlotNames::find_slot_names(&component)
            } else {
                vec![]
            };

            expr.tag_name = self.mutation.tag_name.clone();
            expr.namespace = namespace;

            println!("{:?}", slot_names);

            for slot_name in slot_names {
                let existing_insert = expr.body.iter_mut().find(|x| {
                    if let node::Inner::Insert(insert) = x.get_inner() {
                        insert.name == slot_name
                    } else {
                        false
                    }
                });

                if existing_insert.is_none() {
                    expr.body.push(
                        node::Inner::Insert(ast::pc::Insert {
                            name: slot_name,
                            ..Default::default()
                        })
                        .get_outer(),
                    );
                }
            }
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
        let render_node = upsert_render_expr(expr, false);
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
