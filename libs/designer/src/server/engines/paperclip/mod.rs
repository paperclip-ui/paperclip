use std::collections::HashMap;

use anyhow::Result;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;
use tokio::join;

use crate::handle_store_events;
use crate::server::core::{ServerEngineContext, ServerEvent};
use crate::server::io::ServerIO;

pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    join!(handle_events(ctx.clone()));
    join!(load_files(ctx.clone()));
    Ok(())
}

async fn handle_events<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) {
    let next = ctx.clone();
    handle_store_events!(
        &ctx.store,
        ServerEvent::PaperclipFilesLoaded { files } => {
            load_dependency_graph(next.clone(), &files).await;
        },

        ServerEvent::DependencyGraphLoaded { graph } => {
            evaluate_dependency_graph(next.clone(), &graph).await;
        }
    );
}

async fn load_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: &Vec<String>,
) -> Result<()> {
    // let store = self.store.lock().await;
    let graph = Graph::load_files3(files, &ctx.io).await?;

    ctx.emit(ServerEvent::DependencyGraphLoaded { graph });

    Ok(())
}

async fn load_files<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let state = ctx.lock_store().state.options.config_context.clone();
    let files = ctx.io.get_all_designer_files(&state);
    ctx.emit(ServerEvent::PaperclipFilesLoaded { files });
    Ok(())
}

async fn evaluate_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    graph: &Graph,
) -> Result<()> {
    let mut output: HashMap<String, (css::virt::Document, html::virt::Document)> = HashMap::new();

    for (path, dep) in &graph.dependencies {
        let css = css::evaluator::evaluate(path, graph, &ctx.io).await?;
        let html = html::evaluator::evaluate(
            path,
            graph,
            &ctx.io,
            html::evaluator::Options {
                include_components: true,
            },
        )
        .await?;
        output.insert(path.to_string(), (css, html));
    }

    ctx.emit(ServerEvent::ModulesEvaluated(output));
    Ok(())
}
