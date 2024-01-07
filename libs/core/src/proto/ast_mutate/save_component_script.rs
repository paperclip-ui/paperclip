use super::base::EditContext;
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse;
use paperclip_proto::ast::pc::{component_body_item, Component};
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::ast_mutate::SaveComponentScript;

use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<SaveComponentScript> {
    fn visit_component(&self, doc: &mut Component) -> VisitorResult<(), Self> {
        if &self.mutation.component_id != &doc.id {
            return VisitorResult::Continue;
        }

        doc.body.retain(|script| {
            if let component_body_item::Inner::Script(script) = script.get_inner() {
                if let Some(id) = &self.mutation.script_id {
                    return script.get_id() != id;
                }
                script.get_target() != Some(self.mutation.target.clone())
            } else {
                true
            }
        });

        let dummy_component: Component = parse(
            format!(
                r#"
            component Dummy {{
                script(src: "{}", target: "{}", name: "{}")
            }}
        "#,
                self.mutation.src, self.mutation.target, self.mutation.name
            )
            .as_str(),
            &self.new_id(),
            &Options::all_experiments(),
        )
        .expect("Unable to parse")
        .body
        .get(0)
        .expect("Should exist")
        .try_into()
        .expect("Unable to parse");

        let new_script = dummy_component
            .body
            .into_iter()
            .find(|script| {
                if let component_body_item::Inner::Script(script) = script.get_inner() {
                    script.get_target() == Some(self.mutation.target.clone())
                } else {
                    true
                }
            })
            .expect("Script must exist");

        doc.body.insert(0, new_script);

        VisitorResult::Return(())
    }
}
