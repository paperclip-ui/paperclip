mod append_child;
mod insert_frame;
mod set_frame_bounds;
mod delete_expression;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use paperclip_proto::ast;
pub use paperclip_proto::ast_mutate::*;
pub use set_frame_bounds::*;
pub use delete_expression::*;

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

mutations! {
  InsertFrame,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
