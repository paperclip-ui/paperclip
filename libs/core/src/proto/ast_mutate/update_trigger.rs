use paperclip_parser::{core::parser_context::Options, pc::parser::parse};
use paperclip_proto::{
    ast::{
        all::visit::{MutableVisitor, VisitorResult},
        pc::Trigger,
    },
    ast_mutate::{update_variant_trigger, UpdateTrigger},
};

use super::EditContext;

impl MutableVisitor<()> for EditContext<UpdateTrigger> {
    fn visit_trigger(&self, expr: &mut Trigger) -> VisitorResult<(), Self> {
        if expr.id != self.mutation.trigger_id {
            return VisitorResult::Continue;
        }

        let mock_src = format!(
            r#"
              public trigger {} {{
                {}
              }}
            "#,
            expr.name,
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
        let doc = parse(&mock_src, &self.new_id(), &Options::new(vec![])).unwrap();
        let triggers = doc.get_triggers();

        let trigger = *triggers.get(0).unwrap();

        expr.body = trigger.body.clone();

        return VisitorResult::Return(());
    }
}
