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

macro_rules! edit_actions {
    ($($name:ident), *) => {
        
      pub enum Edit {
        $(
          $name($name),
        )*
      }

      impl ApplyEdit for Edit {
        fn apply(&mut self, graph: &mut graph::Graph) {
          match self {
            $(
              Self::$name(action) => {
                action.apply(graph);
              }
            )*
          }
        }
      }

      $(
        impl ApplyEdit for $name {
          fn apply(&mut self, graph: &mut graph::Graph) {
            for (_path, dep) in &mut graph.dependencies {
              dep.document.accept(self);
            }
          }
        }
      )*

    };
}


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

edit_actions! {
  AppendChild
}