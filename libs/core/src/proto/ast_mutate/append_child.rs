use crate::proto::ast::paste::paste_expression;

use super::base::EditContext;
use super::utils::get_unique_document_body_item_name;
use paperclip_common::log::log_error;
use paperclip_proto::ast;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::ast_mutate::{
    mutation, mutation_result, AddImport, AppendChild, ExpressionInserted,
};

use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

macro_rules! append_child {
    ($context: expr, $expr: expr, $set_name: expr) => {{
        if $expr.get_id() == &$context.mutation.parent_id {
            let paste_result = paste_expression(
                &$context.mutation.child_source,
                None,
                &$context.get_dependency(),
                &$context.expr_map,
            )
            .expect("Unable to parse child source for AppendChild");

            for child in &paste_result.expressions {
                if let Ok(mut child) = TryInto::<Node>::try_into(child.clone()) {
                    let id = child.get_id().to_string();

                    if $set_name {
                        child.set_name(&get_unique_document_body_item_name(
                            child.get_id(),
                            &child.get_name().unwrap_or("unnamed".to_string()),
                            $context
                                .get_dependency()
                                .document
                                .as_ref()
                                .expect("Document must exist"),
                        ));
                    }

                    $expr.body.push(child);
                    $context.add_change(
                        mutation_result::Inner::ExpressionInserted(ExpressionInserted { id })
                            .get_outer(),
                    );
                } else {
                    println!("{:#?}", child);
                    log_error("Cannot append child");
                }
            }

            for (ns, path) in &paste_result.imports {
                $context.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: ns.clone(),
                        path: path.to_string(),
                    })
                    .get_outer(),
                );
            }
            VisitorResult::Return(())
        } else {
            VisitorResult::Continue
        }
    }};
}

impl MutableVisitor<()> for EditContext<AppendChild> {
    fn visit_document(
        &self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        append_child!(self, expr, true)
    }
    fn visit_insert(&self, expr: &mut ast::pc::Insert) -> VisitorResult<(), Self> {
        append_child!(self, expr, false)
    }
    fn visit_slot(&self, expr: &mut ast::pc::Slot) -> VisitorResult<(), Self> {
        append_child!(self, expr, false)
    }
    fn visit_text_node(&self, expr: &mut ast::pc::TextNode) -> VisitorResult<(), Self> {
        if &self.mutation.parent_id != &expr.id {
            return VisitorResult::Continue;
        }
        let parent = self
            .expr_map
            .get_parent(&expr.id)
            .expect("Parent must exist");

        self.add_post_mutation(
            mutation::Inner::AppendChild(AppendChild {
                parent_id: parent.get_id().to_string(),
                child_source: self.mutation.child_source.clone(),
            })
            .get_outer(),
        );

        VisitorResult::Return(())
    }
    fn visit_element(
        &self,
        expr: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        append_child!(self, expr, false)
    }
}
