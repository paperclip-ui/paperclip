use paperclip_proto::ast::{
  self,
  pc::Node,
  all::{Visitable, Visitor, Expression},
};
use paperclip_parser::{graph};

pub struct DeleteExpr {
  pub owner: String,
  pub id: String
}

impl Visitor for DeleteExpr {
  fn visit_document(&mut self, expr: &mut ast::pc::Document) -> bool {
    if expr.get_id() == &self.owner {
    //   expr.body.push(self.node.clone().try_into().unwrap());
    } 
    true  
  }
  fn visit_element(&mut self, expr: &mut ast::pc::Element) -> bool {
    // if expr.get_id() == &self.id {
    //   expr.body.push(self.node.clone());
    // }
    true
  }
}
