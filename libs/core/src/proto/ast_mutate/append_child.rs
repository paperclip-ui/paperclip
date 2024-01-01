use super::base::EditContext;
use super::utils::{get_unique_document_body_item_name, parse_node};
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast_mutate::{mutation_result, AppendChild, ExpressionInserted};

use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<AppendChild> {
    fn visit_document(
        &self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        if expr.get_id() == &self.mutation.parent_id {
            let child = parse_pc(
                &self.mutation.child_source,
                &self.new_id(),
                &Options::new(vec![]),
            )
            .expect("Unable to parse child source for AppendChild");
            let mut child = child.body.get(0).unwrap().clone();
            child.set_name(&get_unique_document_body_item_name(
                child.get_id(),
                &child.get_name().unwrap_or("unnamed".to_string()),
                &self.get_dependency(),
            ));

            expr.body.push(child.clone());
            self.add_change(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
    fn visit_element(
        &self,
        expr: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<AppendChild>> {
        if expr.get_id() == &self.mutation.parent_id {
            let child: Node = parse_node(&self.mutation.child_source, &self.new_id());
            expr.body.push(child.clone());

            self.add_change(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
}
