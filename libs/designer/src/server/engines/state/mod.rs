use anyhow::Result;
use parking_lot::Mutex;
use std::sync::Arc;

use crate::handle_store_events;

use crate::server::core::{ServerEngineContext, ServerEvent, ServerStore};
use crate::server::io::ServerIO;

#[derive(Clone)]
pub struct StateEngine {
    store: Arc<Mutex<ServerStore>>,
}

pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let next = ctx.clone();
    handle_store_events!(&ctx.store, ServerEvent::DependencyGraphLoaded { graph } => {
      next.store.lock().state.graph = graph.clone();
    });
    Ok(())
}
