mod add_import;
mod append_child;
mod base;
mod convert_to_component;
mod convert_to_slot;
mod delete_expression;
mod move_expression_to_file;
mod move_node;
mod prepend_child;
mod save_component_script;
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
mod update_trigger;
mod update_variant;
mod wrap_in_element;
#[macro_use]

pub mod utils;
use std::{collections::HashMap, rc::Rc};

use crate::config::ConfigContext;

use super::graph::{get_document_imports, io::IO};
use anyhow::Result;
pub use base::*;
pub use convert_to_component::*;
pub use paperclip_proto::ast;
use paperclip_proto::ast::expr_map::ExprMap;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::visit::{MutableVisitable, MutableVisitor, VisitorResult};
pub use paperclip_proto::ast_mutate::*;

#[cfg(test)]
mod test;

macro_rules! mutations {
    ($($name:ident), *) => {
      impl MutableVisitor<()> for base::EditContext<Mutation> {
        fn visit_dependency(&self, dependency: &mut ast::graph::Dependency) -> VisitorResult<(), base::EditContext<Mutation>> {
          match self.mutation.inner.as_ref().expect("Inner must exist") {
            $(
              mutation::Inner::$name(mutation) => {
                let mut sub = self.with_mutation(mutation.clone());
                let ret = dependency.accept(&mut sub);
                let option: Option<()> = ret.into();
                option.into()
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
    config_context: &ConfigContext,
) -> Result<Vec<(String, Vec<MutationResult>)>> {
    let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

    let ctx_graph = Rc::new(graph.clone());

    let expr_map = Rc::new(ExprMap::from_graph(&graph));

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            let mut mutations = vec![mutation.clone()];

            while !mutations.is_empty() {
                let mutation = mutations.remove(0);
                let mut ctx = EditContext::new(
                    mutation.clone(),
                    &dep.path,
                    ctx_graph.clone(),
                    config_context,
                    expr_map.clone(),
                );
                let _ret = dep.accept(&mut ctx);

                if ctx.changes.borrow().len() > 0 {
                    changed.push((path.to_string(), ctx.changes.borrow().clone().to_vec()));
                }

                mutations.extend(ctx.post_mutations.borrow().clone());
            }

            let doc = dep.document.as_ref().expect("Document must exist");
            dep.imports = get_document_imports(doc, &dep.path, io)?;
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
  ToggleInstanceVariant,
  UpdateDependencyPath,
  UpdateVariant,
  MoveExpressionToFile,
  UpdateTrigger,
  AddImport,
  SetTagName,
  PrependChild,
  SetTextNodeValue,
  ConvertToComponent,
  SetStyleMixins,

  SetStyleDeclarationValue,
  SaveComponentScript,
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
