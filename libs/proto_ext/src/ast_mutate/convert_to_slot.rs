use paperclip_proto::{
    ast::{
        all::Expression,
        pc::{node, Document, Node, Slot},
    },
    ast_mutate::{mutation_result, ConvertToSlot, ExpressionInserted},
};

use super::{utils::get_named_expr_id, EditContext};
use crate::{
    ast::{
        all::{MutableVisitor, VisitorResult},
        get_expr::GetExpr,
    },
    replace_child,
};

impl MutableVisitor<()> for EditContext<ConvertToSlot> {
    fn visit_render(&mut self, expr: &mut paperclip_proto::ast::pc::Render) -> VisitorResult<()> {
        if expr.node.as_ref().unwrap().get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }

        let node = expr.node.as_ref().unwrap().clone();
        let slot = create_slot(self, node, &self.new_id());

        *expr.node.as_mut().unwrap() = slot;

        VisitorResult::Return(())
    }
    fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
    fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
    fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
        replace_child!(
            &mut expr.body,
            self.mutation.expression_id,
            |child: &Node| { create_slot(self, child.clone(), &self.new_id()) }
        )
    }
}

fn create_slot(ctx: &mut EditContext<ConvertToSlot>, child: Node, id: &str) -> Node {
    ctx.add_change(
        mutation_result::Inner::ExpressionInserted(ExpressionInserted { id: id.to_string() })
            .get_outer(),
    );

    node::Inner::Slot(Slot {
        id: id.to_string(),
        name: get_unique_slot_name(
            &ctx.mutation.expression_id,
            ctx.get_dependency()
                .document
                .as_ref()
                .expect("Document must exist"),
        ),
        range: None,
        body: vec![child],
    })
    .get_outer()
}

fn get_unique_slot_name(id: &str, doc: &Document) -> String {
    let base_name = "children".to_string();
    let owner_component = GetExpr::get_owner_component(id, doc).expect("Component must exist!");
    let mut i = 0;
    let mut name = base_name.to_string();

    while matches!(get_named_expr_id(&name, owner_component), Some(_)) {
        i += 1;
        name = format!("{}{}", base_name, i);
    }

    name
}
