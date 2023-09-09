use crate::server::{
    core::{ServerEngineContext, ServerEvent},
    io::ServerIO,
};
use anyhow::Result;

use paperclip_proto::ast_mutate::{Mutation, MutationResult};
use paperclip_proto_ext::ast_mutate::edit_graph;

pub async fn apply_mutations<TIO: ServerIO>(
    mutations: &Vec<Mutation>,
    ctx: ServerEngineContext<TIO>,
) -> Result<Vec<MutationResult>> {
    let mut graph = ctx.store.lock().unwrap().state.graph.clone();

    println!("Applying {:#?}", mutations);
    let result = edit_graph(&mut graph, mutations, &ctx.io)?;
    println!("Mutation result: {:#?}", result);

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
