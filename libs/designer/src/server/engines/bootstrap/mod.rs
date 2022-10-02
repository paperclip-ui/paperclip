use crate::server::{core::ServerEngineContext, core::ServerEvent};
use crate::{handle_store_events, server::io::ServerIO};
use anyhow::Result;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let next = ctx.clone();
    handle_store_events!(&next.store, ServerEvent::APIServerStarted { port } => {
        if next.store.lock().unwrap().state.options.open {
            open::that(format!("http://localhost:{}", port)).unwrap();
        }
    });
    Ok(())
}

pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    Ok(())
}
