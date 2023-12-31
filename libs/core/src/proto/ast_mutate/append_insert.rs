use super::base::EditContext;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{mutation_result, AppendInsert, ExpressionInserted};

use super::utils::parse_node;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<AppendInsert> {
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.id != self.mutation.instance_id {
            return VisitorResult::Continue;
        }

        let child = parse_node(&self.mutation.child_source, &self.new_id());
        let child_id = child.get_id().to_string();

        let existing = expr.body.iter_mut().find_map(|child| {
            if let ast::pc::node::Inner::Insert(ins) = child.get_inner_mut() {
                if ins.name == self.mutation.slot_name {
                    Some(ins)
                } else {
                    None
                }
            } else {
                None
            }
        });

        if let Some(insert) = existing {
            insert.body.push(child);
        } else {
            expr.body.push(
                ast::pc::node::Inner::Insert(ast::pc::Insert {
                    id: self.new_id(),
                    range: None,
                    name: self.mutation.slot_name.to_string(),
                    body: vec![child],
                })
                .get_outer(),
            );
        }

        self.add_change(
            mutation_result::Inner::ExpressionInserted(ExpressionInserted { id: child_id })
                .get_outer(),
        );

        VisitorResult::Return(())
    }
}
