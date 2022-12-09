
use paperclip_proto::{ast_mutate::ConvertToSlot, ast::{all::{Expression}, pc::{node , Slot, Document, DocumentBodyItem, Node}}};

use crate::{ast::{all::{VisitorResult, MutableVisitor}, get_expr::GetExpr}, replace_child};
use super::{EditContext, utils::get_named_expr_id};




impl<'a> MutableVisitor<()> for EditContext<'a, ConvertToSlot> {
  fn visit_render(&mut self, expr: &mut paperclip_proto::ast::pc::Render) -> VisitorResult<()> {
    if expr.node.as_ref().unwrap().get_id() != self.mutation.expression_id {
      return VisitorResult::Continue
    }

    let node = expr.node.as_ref().unwrap().clone();
    let slot = create_slot(&self, node, &expr.checksum());
    
    std::mem::replace(expr.node.as_mut().unwrap(), slot);
    
    VisitorResult::Return(())
  }
  fn visit_slot(&mut self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
    replace_child!(&mut expr.body, self.mutation.expression_id, |child: &Node| {
      create_slot(self, child.clone(), child.checksum().as_str())
    })
  }
  fn visit_element(&mut self, expr: &mut paperclip_proto::ast::pc::Element) -> VisitorResult<()> {
    replace_child!(&mut expr.body, self.mutation.expression_id, |child: &Node| {
      create_slot(self, child.clone(), child.checksum().as_str())
    })
  }
  fn visit_insert(&mut self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<()> {
    replace_child!(&mut expr.body, self.mutation.expression_id, |child: &Node| {
      create_slot(self, child.clone(), child.checksum().as_str())
    })
  }
}

fn create_slot<'a>(ctx: &EditContext<'a, ConvertToSlot>, child: Node, checksum: &str) -> Node {

  node::Inner::Slot(Slot {
    id: format!("{}-slot", checksum),
    name: get_unique_slot_name(&ctx.mutation.expression_id, ctx.dependency.document.as_ref().expect("Document must exist")),
    range: None,
    body: vec![child]
  }).get_outer()
}

fn get_unique_slot_name(id: &str, doc: &Document) -> String {
  let base_name = "child".to_string();
  let owner_component = GetExpr::get_owner_component(id, doc).expect("Component must exist!");
  let mut i = 0;
  let mut name = base_name.to_string();

  while matches!(get_named_expr_id(&name, owner_component), Some(_)) {
    i += 1;
    name = format!("{}{}", base_name, i);
  }


  name
}