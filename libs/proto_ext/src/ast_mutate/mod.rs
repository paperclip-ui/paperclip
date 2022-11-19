mod append_child;
mod delete_expression;
mod insert_frame;
mod set_frame_bounds;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use delete_expression::*;
pub use paperclip_proto::ast;
pub use paperclip_proto::ast_mutate::*;
pub use set_frame_bounds::*;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl Visitor<Vec<MutationResult>> for Mutation {
        fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult<Vec<MutationResult>> {
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
