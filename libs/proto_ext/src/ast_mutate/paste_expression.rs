
/**
 * TODO: return error if cannot paste in a particular spot. E.g: slots in document
 */
use paperclip_ast_serialize::pc::serialize_node;
use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use paperclip_proto::ast::pc::{Node, Element, Component};
use paperclip_proto::ast::{all::Expression, pc::node};
use paperclip_proto::ast_mutate::{paste_expression, PasteExpression};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted};


use super::EditContext;
use super::utils::{resolve_import_ns};
use crate::ast::all::{MutableVisitor, VisitorResult};
use crate::ast::get_expr::GetExpr;
use crate::ast_mutate::utils::{parse_node, resolve_import, parse_import};

#[macro_export]
macro_rules! paste_expr {
    ($self: expr, $expr: expr) => {{
        if $self.mutation.target_expression_id != $expr.id {
            return VisitorResult::Continue;
        }

        let item = $self.mutation.item.as_ref().expect("item must exist");

        let node = clone_pasted_expr(item, $self.get_dependency(), &$self.graph);

        if let Some(node) = node {
            $self.changes.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: node.get_id().to_string(),
                })
                .get_outer(),
            );
            $expr.body.push(node.try_into().expect("Must be node"));

        }

        VisitorResult::Return(())
    }};
}

fn clone_pasted_expr(expr: &paste_expression::Item, dep: &Dependency, graph: &Graph) -> Option<Node> {
    let node = match expr {
        paste_expression::Item::Element(el) => Some(node::Inner::Element(el.clone()).get_outer()),
        paste_expression::Item::TextNode(el) => Some(node::Inner::Text(el.clone()).get_outer()),
        paste_expression::Item::Component(component) => {

            let (graph_component, component_dep) = GetExpr::get_expr_from_graph(&component.id, &graph).expect("Component must exist");

            let graph_component: Component = graph_component.try_into().expect("Must be component");

            let namespace = if component_dep.path == dep.path {
                None
            } else {
                Some(resolve_import_ns(dep, &component_dep.path).0)
            };


            let el = Element {
                namespace,
                id: dep.document.as_ref().unwrap().checksum().to_string(),
                name: None,
                tag_name: graph_component.name.to_string(),
                parameters: vec![],
                range: None,
                body: vec![]
            };

            Some(node::Inner::Element(el).get_outer())
        }
    };

    if let Some(node) = node {
        // Clone node to refresh IDs
        let mut context = Context::new(0);
        serialize_node(&node, &mut context);
        Some(parse_node(
            &context.buffer,
            &dep.document.as_ref().unwrap().checksum(),
        ))
    } else {
        None
    }
}

impl<'a> MutableVisitor<()> for EditContext<'a, PasteExpression> {
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        paste_expr!(self, expr)
    }
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {

        let doc = self.get_dependency().document.as_ref().unwrap();

        if self.mutation.target_expression_id != expr.id && GetExpr::get_expr(&self.mutation.target_expression_id, doc).is_none() {
            return VisitorResult::Continue;
        }

        if let Some(paste_expression::Item::Component(component)) = &self.mutation.item {

            let (_, component_dep) = GetExpr::get_expr_from_graph(&component.id, &self.graph).expect("Component must exist");


            if component_dep.path != self.get_dependency().path {
                let (ns, is_new_import) = resolve_import_ns(&self.get_dependency(), &component_dep.path);

                if is_new_import {
                    let relative = resolve_import(&self.get_dependency().path, &component_dep.path);
                    expr.body.insert(0, parse_import(&relative, &ns, doc.checksum().as_str()));
                }
            }
        }
        

        paste_expr!(self, expr)
    }
}
