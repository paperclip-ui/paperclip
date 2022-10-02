use std::collections::HashMap;

use anyhow::Result;
use paperclip_evaluator::css;

use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_evaluator::html;
use paperclip_parser::graph::io::IO as GraphIO;
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
        ServerEvent::UpdateFileRequested { path, content: _content } => {
            load_dependency_graph(next.clone(), &vec![path.to_string()]).await.expect("Unable to load dependency");
        },
        ServerEvent::FileWatchEvent(event) => {
            if paperclip_common::pc::is_paperclip_file(&event.path) {
                load_pc_file(next.clone(), &event.path).await.expect(format!("Unable to evaluate file {}", event.path).as_str());
            }
        }
    );
}

struct VirtGraphIO<TIO: ServerIO> {
    ctx: ServerEngineContext<TIO>,
}

impl<TIO: ServerIO> GraphIO for VirtGraphIO<TIO> {}

impl<TIO: ServerIO> FileReader for VirtGraphIO<TIO> {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        if let Some(content) = self.ctx.store.lock().unwrap().state.file_cache.get(path) {
            Ok(content.clone().into_boxed_slice())
        } else {
            self.ctx.io.read_file(path)
        }
    }
}

impl<TIO: ServerIO> FileResolver for VirtGraphIO<TIO> {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String> {
        self.ctx.io.resolve_file(from, to)
    }
}

async fn load_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: &Vec<String>,
) -> Result<()> {
    println!("RELOAD");
    let graph = ctx.store.lock().unwrap().state.graph.clone();

    // let store = self.store.lock().await;
    let graph = graph
        .load_into_partial(files, &VirtGraphIO { ctx: ctx.clone() })
        .await?;

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
    let state = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .clone();
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
                include_components: false,
            },
        )
        .await?;
        output.insert(path.to_string(), (css, html));
    }

    ctx.emit(ServerEvent::ModulesEvaluated(output));
    Ok(())
}
