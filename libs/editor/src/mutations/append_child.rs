use paperclip_proto::ast::{
  self,
  pc::Node,
  all::{Visitable, Visitor, Expression},
};
use paperclip_parser::{graph};

pub struct AppendChild {
  pub parent_id: String,
  pub node: ast::pc::Node
}

impl Visitor for AppendChild {
  fn visit_document(&mut self, expr: &mut ast::pc::Document) -> bool {
    if expr.get_id() == &self.parent_id {
      expr.body.push(self.node.clone().try_into().unwrap());
    } 
    true  
  }
  fn visit_element(&mut self, expr: &mut ast::pc::Element) -> bool {
    if expr.get_id() == &self.parent_id {
      expr.body.push(self.node.clone());
    }
    true
  }
}
