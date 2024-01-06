/**
 * TODO: return error if cannot paste in a particular spot. E.g: slots in document
 */
use paperclip_ast_serialize::pc::serialize_node;
use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::pc::{Component, Element, Insert, Node};
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::{pc::node, wrapper::Expression};
use paperclip_proto::ast_mutate::{mutation, mutation_result, AddImport, ExpressionInserted};
use paperclip_proto::ast_mutate::{paste_expression, PasteExpression};

use super::super::ast::pc::FindSlotNames;
use super::utils::parse_node;
use super::utils::resolve_import_ns;
use super::EditContext;

macro_rules! paste_expr {
    ($self: expr, $expr: expr) => {{
        if $self.mutation.target_expression_id != $expr.id {
            return VisitorResult::Continue;
        }

        let item = $self.mutation.item.as_ref().expect("item must exist");

        let node = clone_pasted_expr(item, &$self);

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

fn clone_pasted_expr<Mutation>(
    expr: &paste_expression::Item,
    ctx: &EditContext<Mutation>,
) -> Option<Node> {
    let dep = ctx.get_dependency();

    let node = match expr {
        paste_expression::Item::Element(el) => Some(node::Inner::Element(el.clone()).get_outer()),
        paste_expression::Item::TextNode(el) => Some(node::Inner::Text(el.clone()).get_outer()),
        paste_expression::Item::Component(component) => {
            let expr = ctx.expr_map.get_expr(&component.id)?;
            let expr_path = ctx.expr_map.get_expr_path(&component.id)?;

            let graph_component: Component = expr.clone().try_into().expect("Must be component");

            let namespace = (expr_path != &dep.path)
                .then(|| resolve_import_ns(dep, &expr_path, None).ok())
                .flatten()
                .and_then(|imp| Some(imp.namespace.to_string()));

            if let Some(namespace) = &namespace {
                ctx.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: namespace.clone(),
                        path: expr_path.to_string(),
                    })
                    .get_outer(),
                )
            }

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
        paste_expr!(self, expr)
    }
}
