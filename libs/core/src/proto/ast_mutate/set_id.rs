use crate::proto::ast_mutate::utils::get_unique_valid_name;

use super::utils::{get_unique_component_name, get_valid_name};
use convert_case::Case;
use paperclip_common::get_or_short;
use paperclip_proto::{
    ast::visit::{MutableVisitor, VisitorResult},
    ast::wrapper::ExpressionWrapper,
    ast::{
        expr_map::ExprMap,
        graph,
        pc::{self, node},
        shared,
    },
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
        let expr_map = self.expr_map.borrow();

        let target_expr = expr_map
            .get_expr(&self.mutation.expression_id)
            .expect("Expr must exist!");

        let instance_component = expr_map.get_instance_component(&expr.id);

        // if children slot is renamed, then take all instance children and wrap in a slot
        if let ExpressionWrapper::Slot(slot) = target_expr {
            if slot.name == "children" {
                let slot_component = slot
                    .get_component(&expr_map)
                    .expect("Slot component must exist");

                let new_name =
                    get_unique_slot_name(&slot.id, &self.mutation.value, &slot_component);

                if slot.name == new_name {
                    return VisitorResult::Continue;
                }

                let instance_component = if let Some(instance_component) = instance_component {
                    instance_component
                } else {
                    return VisitorResult::Continue;
                };

                if slot_component.id == instance_component.id {
                    let mut new_body = vec![];
                    let mut slot_children = vec![];

                    for child in &expr.body {
                        match child.get_inner() {
                            node::Inner::Element(_) | node::Inner::Text(_) => {
                                slot_children.push(child.clone());
                            }
                            _ => {
                                new_body.push(child.clone());
                            }
                        }
                    }

                    let children_insert = node::Inner::Insert(pc::Insert {
                        id: self.new_id(),
                        range: None,
                        name: new_name,
                        body: slot_children,
                    })
                    .get_outer();

                    new_body.push(children_insert);

                    expr.body = new_body;
                };
            }
        }

        if let Some(component) = instance_component {
            if component.id == self.mutation.expression_id {
                let info = get_expr_dep(&self.mutation.expression_id, &self.graph).unwrap();
                match &info.0 {
                    ExpressionWrapper::Component(comp) => {
                        if comp.name != self.mutation.value {
                            expr.tag_name =
                                get_unique_component_name(&comp.id, &self.mutation.value, info.1);
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

        let new_expr_name = get_unique_name(
            expr.get_id(),
            &self.mutation.value,
            &self.graph,
            &self.expr_map.borrow(),
        );

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
                &item.id,
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
                &expr.id,
                &self.mutation.value,
                Case::Camel,
                &self.get_dependency()
            ))
        );
        VisitorResult::Continue
    }
    fn visit_insert(&self, expr: &mut pc::Insert) -> VisitorResult<(), Self> {
        let slot = get_or_short!(
            expr.get_slot(&self.expr_map.borrow()),
            VisitorResult::Continue
        );

        if slot.id != self.mutation.expression_id {
            return VisitorResult::Continue;
        }

        expr.name = get_unique_slot_name(
            &slot.id,
            &self.mutation.value,
            &slot
                .get_component(&self.expr_map.borrow())
                .expect("Component must exist"),
        );

        // TODO - ensure that this is renamed if assoc slot is
        VisitorResult::Continue
    }
    fn visit_slot(&self, expr: &mut pc::Slot) -> VisitorResult<(), EditContext<SetId>> {
        set_name!(
            self,
            expr,
            get_unique_slot_name(
                &expr.id,
                &self.mutation.value,
                &expr
                    .get_component(&self.expr_map.borrow())
                    .expect("Component must exist")
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
                    &expr.id,
                    &self.mutation.value,
                    &self.graph.dependencies.get(&self.path).unwrap()
                )
            );
        }
        VisitorResult::Continue
    }
    fn visit_trigger(&self, expr: &mut pc::Trigger) -> VisitorResult<(), EditContext<SetId>> {
        if expr.name != self.mutation.value {
            set_name!(
                self,
                expr,
                get_unique_valid_name(
                    &expr.id,
                    &self.mutation.value,
                    Case::Camel,
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
            get_unique_valid_name(
                &expr.id,
                &self.mutation.value,
                Case::Camel,
                &self.get_dependency()
            )
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

fn get_unique_name(expr_id: &str, name: &str, graph: &graph::Graph, map: &ExprMap) -> String {
    let (info, dep) = graph.get_expr(expr_id).expect("Must exist");
    match info.expr {
        ExpressionWrapper::Variant(variant) => get_unique_variant_name(
            expr_id,
            name,
            &variant
                .get_component(graph)
                .expect("Component must exist")
                .0,
        ),

        ExpressionWrapper::Slot(slot) => get_unique_slot_name(
            expr_id,
            name,
            &slot.get_component(&map).expect("Component must exist"),
        ),
        _ => get_unique_valid_name(expr_id, name, Case::Camel, dep),
    }
}

fn get_unique_slot_name(expr_id: &str, name: &str, component: &pc::Component) -> String {
    let mut i = 0;
    let fixed_name = get_valid_name(name, Case::Camel);
    let mut new_name = fixed_name.to_string();
    while let Some(expr) = component.get_slot(&new_name) {
        if expr.id == expr_id {
            return new_name;
        }

        i = i + 1;
        new_name = format!("{}{}", fixed_name, i);
    }
    new_name
}

fn get_unique_variant_name(expr_id: &str, name: &str, component: &pc::Component) -> String {
    let mut i = 0;
    let fixed_name = get_valid_name(name, Case::Camel);
    let mut new_name = fixed_name.to_string();
    while let Some(expr) = component.get_variant(&new_name) {
        if expr.id == expr_id {
            return new_name;
        }
        i = i + 1;
        new_name = format!("{}{}", fixed_name, i);
    }
    new_name
}
