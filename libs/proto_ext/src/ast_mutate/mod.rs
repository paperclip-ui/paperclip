mod append_child;
mod base;
mod delete_expression;
mod delete_style_declarations;
mod insert_frame;
mod set_frame_bounds;
mod set_style_declarations;
mod toggle_variants;
mod update_variant;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use base::*;
pub use delete_expression::*;
pub use delete_style_declarations::*;
pub use paperclip_proto::ast;
pub use paperclip_proto::ast_mutate::*;
pub use set_frame_bounds::*;
pub use set_style_declarations::*;
pub use toggle_variants::*;
pub use update_variant::*;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl<'expr> Visitor<Vec<()>> for base::EditContext<'expr, Mutation> {
        fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult<Vec<()>> {
          match self.mutation.inner.as_ref().expect("Inner must exist") {
            $(
              mutation::Inner::$name(mutation) => {
                let mut sub: base::EditContext<$name> = base::EditContext {
                  mutation,
                  dependency: self.dependency.clone(),
                  changes: vec![]
                };
                let ret = document.accept(&mut sub);
                self.changes.extend(sub.changes);
                ret
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
  ToggleVariants,
  UpdateVariant,
  DeleteStyleDeclarations,
  SetStyleDeclarations,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
