use anyhow::Result;
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
            load_dependency_graph(next.clone(), files).await;
        },

        ServerEvent::DependencyGraphLoaded { graph } => {
            // evaluate_dependency_graph(next.clone(), graph).await;
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
    println!("Loading Paperclip files");
    let state = ctx.lock_store().state.options.config_context.clone();
    let files = ctx.io.get_all_designer_files(&state);
    ctx.emit(ServerEvent::PaperclipFilesLoaded { files });
    Ok(())
}
