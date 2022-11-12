mod append_child;
mod base;
use crate::add_inner_wrapper;
use crate::ast;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use base::*;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl Visitor for Mutation {
        fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult {
          match self.inner.as_mut().expect("Unner must exist") {
            $(
              mutation::Inner::$name(mutation) => {
                document.accept(mutation)
              }
            )*
            _ => {
              VisitorResult::Continue
            }
          }
        }
      }


    };
}

add_inner_wrapper!(mutation::Inner, Mutation);

mutations! {
  AppendChild
}
