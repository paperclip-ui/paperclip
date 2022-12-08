mod append_child;
mod base;
mod delete_expression;
mod delete_style_declarations;
mod insert_frame;
mod set_frame_bounds;
mod set_style_declarations;
mod toggle_variants;
mod update_variant;
mod convert_to_component;
use crate::ast::all::{Visitable, Visitor, VisitorResult};
pub use append_child::*;
pub use base::*;
pub use convert_to_component::*;
pub use delete_expression::*;
pub use delete_style_declarations::*;
pub use paperclip_proto::ast;
use paperclip_proto::ast::graph_ext::Graph;
pub use paperclip_proto::ast_mutate::*;
pub use set_frame_bounds::*;
pub use set_style_declarations::*;
pub use toggle_variants::*;
pub use update_variant::*;

#[cfg(test)]
mod test;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl<'expr> Visitor<()> for base::EditContext<'expr, Mutation> {
        fn visit_document(&mut self, document: &mut ast::pc::Document) -> VisitorResult<()> {
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



pub fn edit_graph(
  graph: &mut Graph,
  mutations: &Vec<Mutation>,
) -> Vec<(String, Vec<MutationResult>)> {
  let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

  for mutation in mutations {
      for (path, dep) in &mut graph.dependencies {
          let mut ctx = EditContext {
              mutation,
              dependency: dep.clone(),
              changes: vec![],
          };
          dep.document
              .as_mut()
              .expect("Document must exist")
              .accept(&mut ctx);

          if ctx.changes.len() > 0 {
              changed.push((path.to_string(), ctx.changes.clone()));
          }
      }
  }
  return changed;
}


mutations! {
  InsertFrame,
  ToggleVariants,
  UpdateVariant,
  ConvertToComponent,
  DeleteStyleDeclarations,
  SetStyleDeclarations,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
