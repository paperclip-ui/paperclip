use super::base::EditContext;
use super::utils::{get_unique_document_body_item_name, parse_node};
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitable, MutableVisitor, VisitorResult};
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted, PrependChild};

use crate::ast_mutate::utils::upsert_render_expr;

macro_rules! prepend_child {
    ($self:expr, $expr: expr) => {{
        if $expr.get_id() == &$self.mutation.parent_id {
            let child: Node = parse_node(&$self.mutation.child_source, &$self.new_id());
            $expr.body.insert(0, child.clone());

            $self.changes.borrow_mut().push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }};
}

impl MutableVisitor<()> for EditContext<PrependChild> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.parent_id {
            let child = parse_pc(
                &self.mutation.child_source,
                &self.new_id(),
                &Options::new(vec![]),
            )
            .expect("Unable to parse child source for AppendChild");
            let mut child = child.body.get(0).unwrap().clone();

            child.set_name(&get_unique_document_body_item_name(
                &child.get_name().unwrap_or("unnamed".to_string()),
                &self.get_dependency(),
            ));

            self.changes.borrow_mut().push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );

            expr.body.insert(0, child);
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        prepend_child!(self, expr)
    }
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
        if expr.get_id() != &self.mutation.parent_id {
            return VisitorResult::Continue;
        }

        let render: &mut ast::pc::Render = upsert_render_expr(expr, true, &self);

        let mut ctx = self.with_mutation(PrependChild {
            parent_id: render
                .node
                .as_ref()
                .expect("Node must exist")
                .get_id()
                .to_string(),
            child_source: self.mutation.child_source.clone(),
        });

        render
            .node
            .as_mut()
            .expect("Node must exist")
            .accept(&mut ctx)
    }
    fn visit_insert(&mut self, expr: &mut ast::pc::Insert) -> VisitorResult<()> {
        prepend_child!(self, expr)
    }
    fn visit_slot(&mut self, expr: &mut ast::pc::Slot) -> VisitorResult<()> {
        prepend_child!(self, expr)
    }
}
