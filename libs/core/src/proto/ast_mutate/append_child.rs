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
    ($context: expr, $expr: expr) => {{
        if $expr.get_id() == &$context.mutation.parent_id {
            let paste_result = paste_expression(
                &$context.mutation.child_source,
                None,
                &$context.get_dependency(),
                &$context.expr_map,
            )
            .expect("Unable to parse child source for AppendChild");

            for child in &paste_result.expressions {
                if let Ok(child) = TryInto::<Node>::try_into(child.clone()) {
                    let id = child.get_id().to_string();
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
        }
        VisitorResult::Continue
    }};
}

impl MutableVisitor<()> for EditContext<AppendChild> {
    fn visit_document(
        &self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        if expr.get_id() == &self.mutation.parent_id {
            let paste_result = paste_expression(
                &self.mutation.child_source,
                None,
                &self.get_dependency(),
                &self.expr_map,
            )
            .expect("Unable to parse child source for AppendChild");

            for child in paste_result.expressions {
                let mut child: Node = if let Ok(child) = child.clone().try_into() {
                    child
                } else {
                    log_error(format!("Unable to convert to document item").as_str());
                    continue;
                };

                child.set_name(&get_unique_document_body_item_name(
                    child.get_id(),
                    &child.get_name().unwrap_or("unnamed".to_string()),
                    self.get_dependency()
                        .document
                        .as_ref()
                        .expect("Document must exist"),
                ));

                expr.body.push(child.clone());
                self.add_change(
                    mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                        id: child.get_id().to_string(),
                    })
                    .get_outer(),
                );
            }
        }
        VisitorResult::Continue
    }
    fn visit_insert(&self, expr: &mut ast::pc::Insert) -> VisitorResult<(), Self> {
        append_child!(self, expr)
    }
    fn visit_slot(&self, expr: &mut ast::pc::Slot) -> VisitorResult<(), Self> {
        append_child!(self, expr)
    }
    fn visit_element(
        &self,
        expr: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        append_child!(self, expr)
    }
}
