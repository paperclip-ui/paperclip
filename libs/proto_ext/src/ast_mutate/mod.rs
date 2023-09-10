mod append_child;
mod append_insert;
mod base;
mod convert_to_component;
mod convert_to_slot;
mod delete_expression;
mod insert_frame;
mod move_node;
mod paste_expr;
mod prepend_child;
mod set_element_parameter;
mod set_frame_bounds;
mod set_id;
mod set_style_declaration_value;
mod set_style_declarations;
mod set_style_mixins;
mod set_tag_name;
mod set_text_node_value;
mod toggle_instance_variant;
mod update_dependency_path;
mod update_variant;
mod wrap_in_element;
#[macro_use]

mod utils;
use std::{collections::HashMap, rc::Rc};

use crate::{
    ast::all::{MutableVisitable, MutableVisitor, VisitorResult},
    graph::{get_document_imports, io::IO},
};
use anyhow::Result;
pub use append_child::*;
pub use append_insert::*;
pub use base::*;
pub use convert_to_component::*;
pub use convert_to_slot::*;
pub use delete_expression::*;
pub use move_node::*;
pub use paperclip_proto::ast;
use paperclip_proto::ast::graph;
use paperclip_proto::ast::graph_ext::Graph;
pub use paperclip_proto::ast_mutate::*;
pub use paste_expr::*;
pub use set_element_parameter::*;
pub use set_frame_bounds::*;
pub use set_id::*;
pub use set_style_declaration_value::*;
pub use set_style_declarations::*;
pub use set_style_mixins::*;
pub use set_tag_name::*;
pub use set_text_node_value::*;
pub use toggle_instance_variant::*;
pub use update_dependency_path::*;
pub use update_variant::*;
pub use wrap_in_element::*;

#[cfg(test)]
mod test;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl MutableVisitor<()> for base::EditContext<Mutation> {
        fn visit_dependency(&mut self, dependency: &mut ast::graph::Dependency) -> VisitorResult<()> {
          match self.mutation.inner.as_ref().expect("Inner must exist") {
            $(
              mutation::Inner::$name(mutation) => {
                let mut sub = self.with_mutation(mutation.clone());
                let ret = dependency.accept(&mut sub);
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
    io: &TIO,
) -> Result<Vec<(String, Vec<MutationResult>)>> {
    let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

    let ctx_graph = Rc::new(graph.clone());

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            let mut ctx = EditContext::new(mutation.clone(), &dep.path, ctx_graph.clone());
            dep.accept(&mut ctx);
            let doc = dep.document.as_ref().expect("Document must exist");

            dep.imports = get_document_imports(doc, &dep.path, io)?;

            if ctx.changes.borrow().len() > 0 {
                changed.push((path.to_string(), ctx.changes.borrow().clone().to_vec()));
            }
        }
    }

    let mut new_deps = HashMap::new();

    // need to update deps in case path has changed
    for (_, dep) in &graph.dependencies {
        new_deps.insert(dep.path.clone(), dep.clone());
    }

    graph.dependencies = new_deps;

    return Ok(changed);
}

mutations! {
  InsertFrame,
  ToggleInstanceVariant,
  UpdateDependencyPath,
  UpdateVariant,
  AppendInsert,
  SetTagName,
  PrependChild,
  SetTextNodeValue,
  ConvertToComponent,SetStyleMixins,
  PasteExpression,
  SetStyleDeclarationValue,
  SetElementParameter,
  ConvertToSlot,
  MoveNode,
  WrapInElement,
  SetId,
  SetStyleDeclarations,
  DeleteExpression,
  AppendChild,
  SetFrameBounds
}
