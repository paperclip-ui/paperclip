use super::base::EditContext;
use super::utils::parse_node;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast_mutate::{mutation_result, AppendChild, ExpressionInserted};

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;

impl<'expr> MutableVisitor<()> for EditContext<'expr, AppendChild> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.parent_id {
            let child = parse_pc(&self.mutation.child_source, &expr.checksum())
                .expect("Unable to parse child source for AppendChild");
            let child = child.body.get(0).unwrap();

            expr.body.push(child.clone());
            self.changes.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.parent_id {
            let child: Node = parse_node(&self.mutation.child_source, &expr.checksum());
            expr.body.push(child.clone());

            self.changes.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
}
