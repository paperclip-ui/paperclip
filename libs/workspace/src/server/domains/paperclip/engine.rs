use std::collections::HashMap;

use anyhow::Result;
use paperclip_evaluator::core::io::PCFileResolver;
use paperclip_evaluator::css;

use futures::executor::block_on;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_evaluator::html;
use paperclip_proto_ext::graph::{io::IO as GraphIO, load::LoadableGraph};

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
        ServerEvent::DependencyGraphLoaded { graph: graph } => {
            evaluate_dependency_graph(next.clone(), Some(graph.dependencies.keys().map(|k| {
                k.to_string()
            }).collect())).await.expect("Unable to evaluate Dependency graph");
        },
        ServerEvent::GlobalScriptsLoaded(_) => {
            evaluate_dependency_graph(next.clone(), None).await.expect("Unable to evaluate Dependency graph");
        },
        ServerEvent::UpdateFileRequested { path: _path, content: _content } => {
            let updated_files = next.clone().store.lock().unwrap().state.updated_files.clone();

            println!("Updated files {:?}", updated_files);

            for update_file in updated_files {
                load_dependency_graph(next.clone(), &vec![update_file]).await.expect("Unable to load dependency");
            }
        },
        ServerEvent::ApplyMutationRequested {mutations: _} | ServerEvent::UndoRequested | ServerEvent::RedoRequested  => {
            evaluate_dependency_graph(next.clone(), None).await.expect("Unable to evaluate Dependency graph");
        },
        ServerEvent::FileWatchEvent(event) => {
            if paperclip_common::pc::is_paperclip_file(&event.path) {
                load_pc_file(next.clone(), &event.path).await.expect(format!("Unable to evaluate file {}", event.path).as_str());
            }
        }
    );
}

#[derive(Clone)]
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
    fn get_file_size(&self, path: &str) -> Result<u64> {
        if let Some(content) = self.ctx.store.lock().unwrap().state.file_cache.get(path) {
            Ok(content.len() as u64)
        } else {
            self.ctx.io.get_file_size(path)
        }
    }
}

impl<TIO: ServerIO> FileResolver for VirtGraphIO<TIO> {
    fn resolve_file(&self, from: &str, to: &str) -> Result<String> {
        self.ctx.io.resolve_file(from, to)
    }
}

async fn load_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: &Vec<String>,
) -> Result<()> {
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

    println!("Loaded designer files: {:?}", files);

    ctx.emit(ServerEvent::PaperclipFilesLoaded { files });
    Ok(())
}

async fn evaluate_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: Option<Vec<String>>,
) -> Result<()> {
    let files = if let Some(files) = files {
        files
    } else {
        let store = ctx.store.lock().unwrap();
        store
            .state
            .graph
            .dependencies
            .keys()
            .map(|key| key.clone())
            .collect::<Vec<String>>()
            .clone()
    };

    let mut output: HashMap<String, (css::virt::Document, html::virt::Document)> = HashMap::new();

    // file resolver for embedding

    {
        let resolver = PCFileResolver::new(ctx.io.clone(), ctx.io.clone(), None);
        let graph = &ctx.store.lock().unwrap().state.graph;

        for path in &files {
            let css = block_on(css::evaluator::evaluate(path, &graph, &resolver))?;
            let html = block_on(html::evaluator::evaluate(
                path,
                &graph,
                &resolver,
                html::evaluator::Options {
                    include_components: true,
                },
            ))?;

            output.insert(path.to_string(), (css, html));
        }
    }

    ctx.emit(ServerEvent::ModulesEvaluated(output));

    Ok(())
}
