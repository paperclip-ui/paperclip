/**
 * TODO: return error if cannot paste in a particular spot. E.g: slots in document
 */
use paperclip_ast_serialize::pc::serialize_node;
use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use paperclip_proto::ast::pc::{Component, Element, Insert, Node};
use paperclip_proto::ast::{all::Expression, pc::node};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted};
use paperclip_proto::ast_mutate::{paste_expression, PasteExpression};

use crate::proto::ast_mutate::utils::create_import;

use super::super::ast::pc::FindSlotNames;
use super::utils::parse_node;
use super::utils::resolve_import_ns;
use super::EditContext;
use paperclip_proto::ast::get_expr::GetExpr;

macro_rules! paste_expr {
    ($self: expr, $expr: expr) => {{
        if $self.mutation.target_expression_id != $expr.id {
            return VisitorResult::Continue;
        }

        let item = $self.mutation.item.as_ref().expect("item must exist");

        let node = clone_pasted_expr(&$self, item, $self.get_dependency(), &$self.graph);

        if let Some(node) = node {
            $self.add_change(
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

pub fn clone_pasted_expr<Mutation>(
    ctx: &EditContext<Mutation>,
    expr: &paste_expression::Item,
    dep: &Dependency,
    graph: &Graph,
) -> Option<Node> {
    let node = match expr {
        paste_expression::Item::Element(el) => Some(node::Inner::Element(el.clone()).get_outer()),
        paste_expression::Item::TextNode(el) => Some(node::Inner::Text(el.clone()).get_outer()),
        paste_expression::Item::Component(component) => {
            let (graph_component, component_dep) =
                GetExpr::get_expr_from_graph(&component.id, &graph).expect("Component must exist");

            let graph_component: Component = graph_component.try_into().expect("Must be component");

            let namespace = if component_dep.path == dep.path {
                None
            } else {
                Some(resolve_import_ns(dep, &component_dep.path).namespace)
            };

            let slot_names = FindSlotNames::find_slot_names(component);

            let el = Element {
                namespace,
                id: ctx.new_id(),
                name: None,
                comment: None,
                tag_name: graph_component.name.to_string(),
                parameters: vec![],
                range: None,
                tag_name_range: None,
                body: slot_names
                    .iter()
                    .map(|name| {
                        node::Inner::Insert(Insert {
                            id: ctx.new_id(),
                            name: name.to_string(),
                            range: None,
                            body: vec![],
                        })
                        .get_outer()
                    })
                    .collect::<Vec<Node>>(),
            };

            Some(node::Inner::Element(el).get_outer())
        }
    };

    if let Some(node) = node {
        // Clone node to refresh IDs
        let mut context = Context::new(0);
        serialize_node(&node, &mut context);
        Some(parse_node(&context.buffer, &ctx.new_id()))
    } else {
        None
    }
}

impl MutableVisitor<()> for EditContext<PasteExpression> {
    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), EditContext<PasteExpression>> {
        paste_expr!(self, expr)
    }
    fn visit_slot(
        &self,
        expr: &mut paperclip_proto::ast::pc::Slot,
    ) -> VisitorResult<(), EditContext<PasteExpression>> {
        paste_expr!(self, expr)
    }
    fn visit_insert(
        &self,
        expr: &mut paperclip_proto::ast::pc::Insert,
    ) -> VisitorResult<(), EditContext<PasteExpression>> {
        paste_expr!(self, expr)
    }
    fn visit_document(
        &self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<(), EditContext<PasteExpression>> {
        let doc = self.get_dependency().document.as_ref().unwrap();

        if self.mutation.target_expression_id != expr.id
            && GetExpr::get_expr(&self.mutation.target_expression_id, doc).is_none()
        {
            return VisitorResult::Continue;
        }

        if let Some(paste_expression::Item::Component(component)) = &self.mutation.item {
            let (_, component_dep) = GetExpr::get_expr_from_graph(&component.id, &self.graph)
                .expect("Component must exist");

            if component_dep.path != self.get_dependency().path {
                let info = resolve_import_ns(&self.get_dependency(), &component_dep.path);

                if info.is_new {
                    let relative = &self
                        .config_context
                        .get_module_import_path(&component_dep.path);
                    expr.body
                        .insert(0, create_import(&relative, &info.namespace, &self.new_id()));
                }
            }
        }

        paste_expr!(self, expr)
    }
}
