use std::collections::HashMap;

use anyhow::Result;
use paperclip_evaluator::css;

use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;

use crate::handle_store_events;
use crate::server::core::{ServerEngineContext, ServerEvent};
use crate::server::io::ServerIO;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    handle_events(ctx.clone()).await;
    Ok(())
}
pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    load_files(ctx.clone()).await?;
    Ok(())
}

async fn handle_events<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) {
    let next = ctx.clone();

    handle_store_events!(
        &ctx.store,
        ServerEvent::PaperclipFilesLoaded { files } => {
            load_dependency_graph(next.clone(), &files).await.expect("Unable to load dependency graph");
        },
        ServerEvent::DependencyGraphLoaded { graph } => {
            evaluate_dependency_graph(next.clone(), &graph).await.expect("Unable to evaluate Dependency graph");
        },
        ServerEvent::FileWatchEvent(event) => {
            if paperclip_common::pc::is_paperclip_file(&event.path) {
                load_pc_file(next.clone(), &event.path).await.expect(format!("Unable to evaluate file {}", event.path).as_str());
            }
        }
    );
}

async fn load_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: &Vec<String>,
) -> Result<()> {
    let graph = ctx.store.lock().unwrap().state.graph.clone();

    // let store = self.store.lock().await;
    let graph = graph.load_into_partial(files, &ctx.io).await?;

    ctx.emit(ServerEvent::DependencyGraphLoaded { graph });

    Ok(())
}

async fn load_pc_file<TIO: ServerIO>(ctx: ServerEngineContext<TIO>, file: &str) -> Result<()> {
    let graph = ctx.store.lock().unwrap().state.graph.clone();

    // let store = self.store.lock().await;
    let graph = graph
        .load_into_partial(&vec![file.to_string()], &ctx.io)
        .await?;

    ctx.emit(ServerEvent::DependencyGraphLoaded { graph });

    Ok(())
}

async fn load_files<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let state = ctx.store.lock().unwrap().state.options.config_context.clone();
    let files = ctx.io.get_all_designer_files(&state);
    ctx.emit(ServerEvent::PaperclipFilesLoaded { files });
    Ok(())
}

async fn evaluate_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    graph: &Graph,
) -> Result<()> {
    let mut output: HashMap<String, (css::virt::Document, html::virt::Document)> = HashMap::new();

    for (path, _dep) in &graph.dependencies {
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
