use std::collections::HashMap;

use anyhow::Result;
use paperclip_common::log::log_verbose;
use paperclip_evaluator::core::io::PCFileResolver;
use paperclip_evaluator::css;
use paperclip_proto::notice::base::NoticeList;
use paperclip_validate::print::PrintPrettyError;

use futures::executor::block_on;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_core::proto::ast_mutate;
use paperclip_core::proto::graph::{io::IO as GraphIO, load::LoadableGraph};
use paperclip_evaluator::html;

use crate::server::core::{ServerEngineContext, ServerEvent};
use crate::server::domains::paperclip::utils::apply_mutations;
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
            load_dependency_graph(next.clone(), &files).await.print_pretty_error();
        },
        ServerEvent::FileMoved { from_path, to_path } => {
            let _ = move_pc_file(ctx.clone(), from_path, to_path).await;
        },
        ServerEvent::DependencyGraphLoaded { graph } => {
            evaluate_dependency_graph(next.clone(), Some(graph.dependencies.keys().map(|k| {
                k.to_string()
            }).collect())).await.print_pretty_error();
        },
        ServerEvent::GlobalScriptsLoaded(_) => {
            evaluate_dependency_graph(next.clone(), None).await.print_pretty_error();
        },
        ServerEvent::UpdateFileRequested { path: _path, content: _content } => {
            let updated_files = next.clone().store.lock().unwrap().state.updated_files.clone();

            log_verbose(&format!("Updated files {:?}", updated_files));

            for update_file in updated_files {
                load_dependency_graph(next.clone(), &vec![update_file]).await.print_pretty_error();
            }
        },
        ServerEvent::MutationsApplied {result: _, updated_graph: _} | ServerEvent::UndoRequested | ServerEvent::RedoRequested  => {
            evaluate_dependency_graph(next.clone(), None).await.print_pretty_error();
        },
        ServerEvent::FileWatchEvent(event) => {
            if paperclip_common::pc::is_paperclip_file(&event.path) {
                load_pc_file(next.clone(), &event.path).await.print_pretty_error();
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
    fn read_directory(&self, path: &str) -> Result<Vec<paperclip_common::fs::FSItem>> {
        self.ctx.io.read_directory(path)
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        if let Some(content) = self.ctx.store.lock().unwrap().state.file_cache.get(path) {
            Ok(content.len() as u64)
        } else {
            self.ctx.io.get_file_size(path)
        }
    }
    fn file_exists(&self, path: &str) -> bool {
        self.ctx
            .store
            .lock()
            .unwrap()
            .state
            .file_cache
            .contains_key(path)
            || self.ctx.io.file_exists(path)
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
) -> Result<(), NoticeList> {
    let graph = ctx.store.lock().unwrap().state.graph.clone();
    let parse_options = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .config
        .into_parser_options();

    // let store = self.store.lock().await;
    let graph = graph
        .load_into_partial(files, &VirtGraphIO { ctx: ctx.clone() }, parse_options)
        .await?;

    ctx.emit(ServerEvent::DependencyGraphLoaded { graph });

    Ok(())
}

async fn load_pc_file<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    file: &str,
) -> Result<(), NoticeList> {
    log_verbose(&format!("load_pc_file {:?}", file));

    let graph = ctx.store.lock().unwrap().state.graph.clone();
    let parse_options = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .config
        .into_parser_options();

    let graph = graph
        .load_into_partial(&vec![file.to_string()], &ctx.io, parse_options)
        .await?;

    ctx.emit(ServerEvent::DependencyGraphLoaded { graph });

    Ok(())
}

async fn load_files<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let files = ctx.io.get_all_designer_files();

    log_verbose(&format!("Loaded designer files: {:?}", files));

    ctx.emit(ServerEvent::PaperclipFilesLoaded { files });
    Ok(())
}

async fn move_pc_file<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    from_path: &str,
    to_path: &str,
) -> Result<()> {
    let mut graph = ctx.store.lock().unwrap().state.graph.clone();
    let dep = graph.dependencies.get(from_path);

    if let Some(dep) = dep {
        let mut dep = dep.clone();
        dep.path = to_path.to_string();
        graph.dependencies.insert(to_path.to_string(), dep.clone());
    }

    apply_mutations(
        &vec![ast_mutate::mutation::Inner::UpdateDependencyPath(
            ast_mutate::UpdateDependencyPath {
                old_path: from_path.to_string(),
                new_path: to_path.to_string(),
            },
        )
        .get_outer()],
        ctx.clone(),
    )
    .await?;

    ctx.emit(ServerEvent::MutationsInternallyApplied);

    Ok(())
}

async fn evaluate_dependency_graph<TIO: ServerIO>(
    ctx: ServerEngineContext<TIO>,
    files: Option<Vec<String>>,
) -> Result<(), NoticeList> {
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

        // if something like Button.pc changes, we want to update all dependents
        // of that too.
        let all_files: Vec<String> = files.iter().fold(vec![], |mut all, path| {
            let deps = graph.get_all_dependents(&path);
            all.push(path.to_string());
            for dep in deps {
                if !all.contains(&dep.path) {
                    all.push(dep.path.to_string());
                }
            }
            all
        });

        for path in &all_files {
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
        log_verbose(&format!("Modules evaluated: {:?}", all_files));
    }

    ctx.emit(ServerEvent::ModulesEvaluated(output));

    Ok(())
}
