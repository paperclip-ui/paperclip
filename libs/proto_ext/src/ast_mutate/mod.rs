mod append_child;
mod base;
mod convert_to_component;
mod convert_to_slot;
mod delete_expression;
mod delete_style_declarations;
mod insert_frame;
mod set_frame_bounds;
mod set_style_declarations;
mod toggle_variants;
mod update_variant;

#[macro_use]
mod utils;
use crate::{ast::all::{MutableVisitable, MutableVisitor, VisitorResult}, graph::{io::IO, get_document_imports}};
use anyhow::Result;
pub use append_child::*;
pub use base::*;
pub use convert_to_component::*;
pub use convert_to_slot::*;
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
      impl<'expr> MutableVisitor<()> for base::EditContext<'expr, Mutation> {
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

pub fn edit_graph<TIO: IO>(
    graph: &mut Graph,
    mutations: &Vec<Mutation>,
    io: &TIO
) -> Result<Vec<(String, Vec<MutationResult>)>> {
    let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            let mut ctx = EditContext {
                mutation,
                dependency: dep.clone(),
                changes: vec![],
            };
            let doc = 
            dep.document
                .as_mut()
                .expect("Document must exist");
            
            doc.accept(&mut ctx);

            dep.imports = get_document_imports(doc, path, io)?;

            if ctx.changes.len() > 0 {
              println!("{:#?}", dep.imports);
                changed.push((path.to_string(), ctx.changes.clone()));
            }
        }
    }
    return Ok(changed);
}

mutations! {
  InsertFrame,
  ToggleVariants,
  UpdateVariant,
  ConvertToComponent,
  ConvertToSlot,
  DeleteStyleDeclarations,
  SetStyleDeclarations,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
