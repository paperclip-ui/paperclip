use paperclip_proto::ast::{
  self,
  pc::Node,
  all::{Visitable, Visitor, Expression},
};
use paperclip_parser::{graph};

pub trait ApplyEdit {
  fn apply(&mut self, _graph: &mut graph::Graph) {

  }
}
