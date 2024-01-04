use paperclip_proto::{
    ast::{
        expr_map::ExprMap,
        pc::{node, Node, Slot},
        visit::{MutableVisitor, VisitorResult},
        wrapper::Expression,
    },
    ast_mutate::{mutation_result, ConvertToSlot, ExpressionInserted},
};

use super::{utils::get_named_expr_id, EditContext};
use crate::replace_child;

impl MutableVisitor<()> for EditContext<ConvertToSlot> {
    fn visit_render(
        &self,
        expr: &mut paperclip_proto::ast::pc::Render,
    ) -> VisitorResult<(), EditContext<ConvertToSlot>> {
        if expr.node.as_ref().unwrap().get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }

        let node = expr.node.as_ref().unwrap().clone();
        let slot = create_slot(self, node, &self.new_id());

        *expr.node.as_mut().unwrap() = slot;

        VisitorResult::Return(())
    }
    fn visit_slot(&self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<(), Self> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), Self> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
    fn visit_insert(&self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<(), Self> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
}

fn create_slot(ctx: &EditContext<ConvertToSlot>, child: Node, id: &str) -> Node {
    ctx.add_change(
        mutation_result::Inner::ExpressionInserted(ExpressionInserted { id: id.to_string() })
            .get_outer(),
    );

    let expr_map: &ExprMap = &ctx.expr_map;

    node::Inner::Slot(Slot {
        id: id.to_string(),
        name: get_unique_slot_name(&ctx.mutation.expression_id, &ctx.mutation.name, expr_map),
        range: None,
        body: vec![child],
    })
    .get_outer()
}

fn get_unique_slot_name(id: &str, name: &String, expr_map: &ExprMap) -> String {
    let base_name = name.clone();
    let owner_component = expr_map
        .get_owner_component(id)
        .expect("Component must exist!");

    let mut i = 0;
    let mut name = base_name.to_string();

    while matches!(get_named_expr_id(&name, owner_component), Some(_)) {
        i += 1;
        name = format!("{}{}", base_name, i);
    }

    name
}
