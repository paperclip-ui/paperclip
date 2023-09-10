use super::base::EditContext;
use paperclip_common::get_or_short;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::pc::{Reference, Variant};
use paperclip_proto::ast_mutate::ToggleInstanceVariant;

use paperclip_proto::ast::get_expr::GetExpr;
impl MutableVisitor<()> for EditContext<ToggleInstanceVariant> {
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.id != self.mutation.instance_id {
            return VisitorResult::Continue;
        }

        let variant: Variant = get_or_short!(
            GetExpr::get_expr_from_graph(&self.mutation.variant_id, &self.graph),
            VisitorResult::Return(())
        )
        .0
        .try_into()
        .expect("Variant must be a variant");

        //find an override element in expr
        let mut component_override = get_component_override(expr);

        if component_override == None {
            expr.body.insert(
                0,
                ast::pc::node::Inner::Override(ast::pc::Override {
                    path: vec![],
                    range: None,
                    id: self.new_id(),
                    body: vec![],
                })
                .get_outer(),
            );

            component_override = get_component_override(expr);
        }

        let component_override = component_override.expect("Component override must exist");
        let mut variant_override = get_variant_override(&variant.name, component_override);

        let combo_variants: Vec<Variant> = self
            .mutation
            .combo_variant_ids
            .iter()
            .map(|id| {
                GetExpr::get_expr_from_graph(id, &self.graph)
                    .expect("Variant doesn't exist")
                    .0
                    .try_into()
                    .expect("Variant must be a variant")
            })
            .collect();

        if variant_override == None {
            component_override.body.push(
                ast::pc::override_body_item::Inner::Variant(Variant {
                    id: self.new_id(),
                    range: None,
                    name: variant.name.to_string(),
                    triggers: vec![],
                })
                .get_outer(),
            );

            variant_override = get_variant_override(&variant.name, component_override);
        }

        let combo_variant_names = combo_variants
            .iter()
            .map(|variant| variant.name.to_string())
            .collect::<Vec<String>>();

        let mut variant_override = variant_override.expect("Variant override must exist");

        if self.mutation.combo_variant_ids.len() > 0 {
            let variant_trigger =
                get_combo_variant_trigger(&combo_variant_names, variant_override.0);

            if variant_trigger.is_none() {
                variant_override
                    .0
                    .triggers
                    .push(ast::pc::TriggerBodyItemCombo {
                        id: self.new_id(),
                        range: None,
                        items: combo_variant_names
                            .iter()
                            .map(|name: &String| {
                                ast::pc::trigger_body_item::Inner::Reference(Reference {
                                    id: self.new_id(),
                                    path: vec![name.to_string()],
                                    range: None,
                                })
                                .get_outer()
                            })
                            .collect(),
                    });
            } else {
                // cover: trigger { a a a a a a a a a a a a a a a }
                while let Some((_, i)) =
                    get_combo_variant_trigger(&combo_variant_names, variant_override.0)
                {
                    variant_override.0.triggers.remove(i);
                }
            }
        } else {
            let enabled_expression = get_enabled_variant_trigger(&mut variant_override.0);
            if let Some((_expr, i)) = enabled_expression {
                variant_override.0.triggers.remove(i);
            } else {
                variant_override
                    .0
                    .triggers
                    .push(ast::pc::TriggerBodyItemCombo {
                        id: self.new_id(),
                        range: None,
                        items: vec![ast::pc::trigger_body_item::Inner::Bool(ast::base::Bool {
                            id: self.new_id(),
                            range: None,
                            value: true,
                        })
                        .get_outer()],
                    });
            }
        }

        VisitorResult::Return(())
    }
}

fn get_component_override(expr: &mut ast::pc::Element) -> Option<&mut ast::pc::Override> {
    for child in &mut expr.body {
        if let ast::pc::node::Inner::Override(override_expr) = child.get_inner_mut() {
            if override_expr.path.len() == 0 {
                return Some(override_expr);
            }
        }
    }
    None
}

fn get_variant_override<'a>(
    name: &str,
    expr: &'a mut ast::pc::Override,
) -> Option<(&'a mut ast::pc::Variant, usize)> {
    for (i, child) in &mut expr.body.iter_mut().enumerate() {
        if let ast::pc::override_body_item::Inner::Variant(variant) = child.get_inner_mut() {
            if variant.name == name {
                return Some((variant, i));
            }
        }
    }
    None
}

fn get_combo_variant_trigger<'a>(
    combo: &Vec<String>,
    expr: &'a mut ast::pc::Variant,
) -> Option<(&'a mut ast::pc::TriggerBodyItemCombo, usize)> {
    for (i, child) in &mut expr.triggers.iter_mut().enumerate() {
        if combo.len() == child.items.len() {
            for name in combo {
                let mut found = false;
                for item in &child.items {
                    if let ast::pc::trigger_body_item::Inner::Reference(reference) =
                        item.get_inner()
                    {
                        if reference.path.len() == 1 && reference.path.get(0) == Some(name) {
                            found = true;
                            break;
                        }
                    }
                }

                if !found {
                    return None;
                }
            }

            return Some((child, i));
        }
    }
    None
}

fn get_enabled_variant_trigger<'a>(
    expr: &'a mut ast::pc::Variant,
) -> Option<(&'a mut ast::base::Bool, usize)> {
    for (i, child) in &mut expr.triggers.iter_mut().enumerate() {
        if child.items.len() == 1 {
            if let ast::pc::trigger_body_item::Inner::Bool(bool_expr) = child
                .items
                .get_mut(0)
                .expect("Item must exist")
                .get_inner_mut()
            {
                return Some((bool_expr, i));
            }
        }
    }
    None
}
