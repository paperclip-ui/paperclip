use convert_case::Case;
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse;
use paperclip_proto::{
    ast::{
        pc::{component_body_item, ComponentBodyItem},
        visit::{MutableVisitor, VisitorResult},
        wrapper::Expression,
    },
    ast_mutate::{
        mutation_result, update_variant_trigger, ExpressionInserted, ExpressionUpdated,
        UpdateVariant,
    },
};

use super::{utils::get_valid_name, EditContext};

impl MutableVisitor<()> for EditContext<UpdateVariant> {
    fn visit_component(
        &self,
        expr: &mut paperclip_proto::ast::pc::Component,
    ) -> VisitorResult<(), EditContext<UpdateVariant>> {
        if expr.id != self.mutation.component_id {
            return VisitorResult::Continue;
        }

        if let Some(variant_id) = &self.mutation.variant_id {
            expr.body = expr
                .body
                .clone()
                .into_iter()
                .filter(|expr| expr.get_id() != variant_id)
                .collect::<Vec<ComponentBodyItem>>();
        }

        let mock_src = format!(
            r#"
      component Filler {{
        variant {} trigger {{
          {}
        }}
      }}
    "#,
            fix_variant_name(&self.mutation.name, &expr.body),
            self.mutation
                .triggers
                .iter()
                .map(|trigger| {
                    match trigger.get_inner() {
                        update_variant_trigger::Inner::Str(value) => {
                            format!("\"{}\"", value)
                        }
                        update_variant_trigger::Inner::Bool(value) => {
                            format!("{}", value)
                        }
                        _ => "".to_string(),
                    }
                })
                .collect::<Vec<String>>()
                .join("\n")
        );

        // ooof...

        let doc = parse(&mock_src, &self.new_id(), &Options::new(vec![]))
            .expect(format!("Unable to parse {}", mock_src).as_str());
        let new_variants = doc.get_components().get(0).unwrap().get_variants();

        let variant = *new_variants.get(0).unwrap();
        let variant_id = variant.id.to_string();

        expr.body.insert(
            0,
            paperclip_proto::ast::pc::component_body_item::Inner::Variant(variant.clone())
                .get_outer(),
        );

        self.add_changes(vec![
            mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
                id: self.mutation.component_id.to_string(),
            })
            .get_outer(),
            mutation_result::Inner::ExpressionInserted(ExpressionInserted { id: variant_id })
                .get_outer(),
        ]);

        return VisitorResult::Continue;
    }
}

fn fix_variant_name(name: &str, siblings: &Vec<ComponentBodyItem>) -> String {
    get_unique_name(&get_valid_name(name, Case::Camel), siblings)
}

fn get_unique_name(name: &str, siblings: &Vec<ComponentBodyItem>) -> String {
    let mut i = 0;
    let mut unique_name = name.to_string();

    loop {
        let contains_name = matches!(
            siblings.iter().find(|child| {
                if let component_body_item::Inner::Variant(child) = child.get_inner() {
                    if child.name == unique_name {
                        return true;
                    }
                }

                return false;
            }),
            Some(_)
        );

        if !contains_name {
            break;
        }

        i += 1;

        unique_name = format!("{}{}", name, i);
    }

    unique_name
}
