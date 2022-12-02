mod append_child;
mod base;
mod delete_expression;
mod delete_style_declarations;
mod insert_frame;
mod set_frame_bounds;
mod set_style_declarations;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use base::*;
pub use delete_expression::*;
pub use delete_style_declarations::*;
pub use paperclip_proto::ast;
pub use paperclip_proto::ast_mutate::*;
pub use set_frame_bounds::*;
pub use set_style_declarations::*;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl<'expr> Visitor<Vec<MutationResult>> for base::EditContext<'expr, Mutation> {
        fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult<Vec<MutationResult>> {
          match self.mutation.inner.as_ref().expect("Inner must exist") {
            $(
              mutation::Inner::$name(mutation) => {
                let mut sub: base::EditContext<$name> = base::EditContext {
                  mutation,
                  dependency: self.dependency.clone()
                };
                document.accept(&mut sub)
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
  DeleteStyleDeclarations,
  SetStyleDeclarations,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
