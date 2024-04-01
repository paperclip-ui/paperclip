
use crate::server::core::{ServerEngineContext, ServerEvent};
use crate::server::io::ServerIO;
use anyhow::Result;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    handle_events(ctx.clone()).await;
    Ok(())
}
pub async fn start<TIO: ServerIO>(_ctx: ServerEngineContext<TIO>) -> Result<()> {
    Ok(())
}

async fn handle_events<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) {
    let next = ctx.clone();

    handle_store_events!(
        &ctx.store,
        ServerEvent::SaveRequested | ServerEvent::MutationsInternallyApplied => {
            save_project(next.clone()).await.expect("Unable to load dependency graph");
        }
    );
}

async fn save_project<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let file_cache = ctx.store.lock().unwrap().state.file_cache.clone();

    for (path, content) in file_cache {
        println!("Saving {}", path);
        if let Err(_err) = std::fs::write(path.clone(), content) {
            println!("Couldn't save {}", path);
        }
    }

    Ok(())
}
