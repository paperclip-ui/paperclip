use crate::server::{
    core::{ServerEngineContext, ServerEvent},
    io::ServerIO,
};
use anyhow::Result;

use paperclip_common::log::verbose;
use paperclip_core::proto::ast_mutate::edit_graph;
use paperclip_proto::ast_mutate::{Mutation, MutationResult};

pub async fn apply_mutations<TIO: ServerIO>(
    mutations: &Vec<Mutation>,
    ctx: ServerEngineContext<TIO>,
) -> Result<Vec<MutationResult>> {
    let mut graph = ctx.store.lock().unwrap().state.graph.clone();
    let config_context = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .clone();

    verbose(&format!("Applying {:#?}", mutations));
    let result = edit_graph(&mut graph, mutations, &ctx.io, &config_context)?;
    verbose(&format!("Mutation result: {:#?}", result));

    let mut latest_ast_changes = vec![];

    for (_path, changes) in &result {
        latest_ast_changes.extend(changes.clone());
    }

    ctx.emit(ServerEvent::MutationsApplied {
        result,
        updated_graph: graph,
    });

    Ok(latest_ast_changes)
}
