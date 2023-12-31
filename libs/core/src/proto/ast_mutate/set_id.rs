use crate::proto::ast_mutate::utils::{get_unique_document_body_item_name, get_unique_valid_name};

use super::utils::{get_unique_component_name, get_valid_name};
use convert_case::Case;
use paperclip_common::get_or_short;
use paperclip_proto::{
    ast::all::{
        visit::{MutableVisitor, VisitorResult},
        ExpressionWrapper,
    },
    ast::{graph, pc, shared},
    ast_mutate::{mutation_result, ExpressionUpdated, SetId},
};

use paperclip_proto::ast::get_expr::get_expr_dep;

use super::EditContext;

macro_rules! set_name {
    ($self: expr, $expr: expr, $value: expr) => {
        if $expr.id == $self.mutation.expression_id {
            $expr.name = $value;
            $self.add_change(
                mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                    id: $expr.id.to_string(),
                })
                .get_outer(),
            );
            true
        } else {
            false
        }
    };
}

impl MutableVisitor<()> for EditContext<SetId> {
    fn visit_element(&self, expr: &mut pc::Element) -> VisitorResult<(), EditContext<SetId>> {
        if set_name!(
            self,
            expr,
            Some(get_valid_name(&self.mutation.value, Case::Camel))
        ) {
            return VisitorResult::Continue;
        }

        if let Some(component) = expr.get_instance_component(&self.graph) {
            if component.id == self.mutation.expression_id {
                let info = get_expr_dep(&self.mutation.expression_id, &self.graph).unwrap();
                match &info.0 {
                    ExpressionWrapper::Component(comp) => {
                        if comp.name != self.mutation.value {
                            expr.tag_name = get_unique_component_name(&self.mutation.value, info.1);
                            self.add_change(
                                mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                                    id: expr.id.to_string(),
                                })
                                .get_outer(),
                            );
                        }
                    }
                    _ => {}
                }
            }
        }

        VisitorResult::Continue
    }
    fn visit_reference(
        &self,
        reference: &mut shared::Reference,
    ) -> VisitorResult<(), EditContext<SetId>> {
        let (expr, _) = get_or_short!(reference.follow(&self.graph), VisitorResult::Continue);

        if expr.get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }

        let new_expr_name = get_unique_name(expr.get_id(), &self.mutation.value, &self.graph);

        if reference.path.len() == 1 {
            reference.path = vec![new_expr_name];
        } else {
            reference.path = vec![
                reference.path.get(0).expect("namespace must exist").clone(),
                new_expr_name,
            ];
        }

        VisitorResult::Continue
    }
    fn visit_variant(&self, item: &mut pc::Variant) -> VisitorResult<(), Self> {
        set_name!(
            self,
            item,
            get_unique_variant_name(
                &self.mutation.value,
                &item
                    .get_component(&self.graph)
                    .expect("Component must exist")
                    .0
            )
        );
        VisitorResult::Continue
    }
    fn visit_style(&self, expr: &mut pc::Style) -> VisitorResult<(), EditContext<SetId>> {
        set_name!(
            self,
            expr,
            Some(get_unique_valid_name(
                &self.mutation.value,
                Case::Camel,
                &self.get_dependency()
            ))
        );
        VisitorResult::Continue
    }
    fn visit_insert(&self, expr: &mut pc::Insert) -> VisitorResult<(), Self> {
        let slot_info = get_or_short!(expr.get_slot(&self.graph), VisitorResult::Continue);

        if slot_info.0.id != self.mutation.expression_id {
            return VisitorResult::Continue;
        }

        expr.name = get_unique_slot_name(
            &self.mutation.value,
            &slot_info
                .0
                .get_component(&self.graph)
                .expect("Component must exist")
                .0,
        );

        // TODO - ensure that this is renamed if assoc slot is
        VisitorResult::Continue
    }
    fn visit_slot(&self, expr: &mut pc::Slot) -> VisitorResult<(), EditContext<SetId>> {
        set_name!(
            self,
            expr,
            get_unique_slot_name(
                &self.mutation.value,
                &expr
                    .get_component(&self.graph)
                    .expect("Component must exist")
                    .0
            )
        );
        VisitorResult::Continue
    }
    fn visit_component(&self, expr: &mut pc::Component) -> VisitorResult<(), EditContext<SetId>> {
        if expr.name != self.mutation.value {
            set_name!(
                self,
                expr,
                get_unique_component_name(
                    &self.mutation.value,
                    &self.graph.dependencies.get(&self.path).unwrap()
                )
            );
        }
        VisitorResult::Continue
    }
    fn visit_text_node(&self, expr: &mut pc::TextNode) -> VisitorResult<(), EditContext<SetId>> {
        set_name!(
            self,
            expr,
            Some(get_valid_name(&self.mutation.value, Case::Camel))
        );
        VisitorResult::Continue
    }
    fn visit_atom(&self, expr: &mut pc::Atom) -> VisitorResult<(), EditContext<SetId>> {
        set_name!(
            self,
            expr,
            get_unique_valid_name(&self.mutation.value, Case::Camel, &self.get_dependency())
        );
        VisitorResult::Continue
    }
    fn visit_condition(&self, expr: &mut pc::Condition) -> VisitorResult<(), EditContext<SetId>> {
        if expr.id == self.mutation.expression_id {
            expr.property = get_valid_name(&self.mutation.value, Case::Camel);
            self.add_change(
                mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                    id: expr.id.to_string(),
                })
                .get_outer(),
            );
            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }
}

fn get_unique_name(expr_id: &str, name: &str, graph: &graph::Graph) -> String {
    let (info, dep) = graph.get_expr(expr_id).expect("Must exist");
    match info.expr {
        ExpressionWrapper::Variant(variant) => get_unique_variant_name(
            name,
            &variant
                .get_component(graph)
                .expect("Component must exist")
                .0,
        ),

        ExpressionWrapper::Slot(slot) => get_unique_slot_name(
            name,
            &slot.get_component(graph).expect("Component must exist").0,
        ),
        _ => get_unique_document_body_item_name(name, dep),
    }
}

fn get_unique_slot_name(name: &str, component: &pc::Component) -> String {
    let mut i = 0;
    let fixed_name = get_valid_name(name, Case::Camel);
    let mut new_name = fixed_name.to_string();
    while matches!(component.get_slot(&new_name), Some(_)) {
        i = i + 1;
        new_name = format!("{}{}", fixed_name, i);
    }
    new_name
}

fn get_unique_variant_name(name: &str, component: &pc::Component) -> String {
    let mut i = 0;
    let fixed_name = get_valid_name(name, Case::Camel);
    let mut new_name = fixed_name.to_string();
    while matches!(component.get_variant(&new_name), Some(_)) {
        i = i + 1;
        new_name = format!("{}{}", fixed_name, i);
    }
    new_name
}
