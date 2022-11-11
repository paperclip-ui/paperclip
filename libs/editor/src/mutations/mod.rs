use paperclip_proto::ast::{
  all::{Visitable},
};
use paperclip_parser::{graph};
mod append_child;
pub use append_child::*;
mod delete_expr;
pub use delete_expr::*;

pub trait ApplyMutation {
  fn apply(&mut self, _graph: &mut graph::Graph) {

  }
}

macro_rules! mutations {
    ($($name:ident), *) => {
        
      pub enum Mutation {
        $(
          $name($name),
        )*
      }

      impl ApplyMutation for Mutation {
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
        impl ApplyMutation for $name {
          fn apply(&mut self, graph: &mut graph::Graph) {
            for (_path, dep) in &mut graph.dependencies {
              dep.document.accept(self);
            }
          }
        }
      )*

    };
}

mutations! {
  AppendChild
}