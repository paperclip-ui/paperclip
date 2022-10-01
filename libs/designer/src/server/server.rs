// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
pub use super::core::{ServerState, StartOptions};
use super::{
    engines::{self},
    io::ServerIO,
};
use crate::machine::engine::EngineContext;
use crate::machine::store::Store;
use anyhow::Result;
use parking_lot::Mutex;
use std::sync::Arc;

#[tokio::main]
pub async fn start<IO: ServerIO>(
    options: StartOptions,
    io: IO,
) -> Result<(), Box<dyn std::error::Error>> {
    let store = Arc::new(Mutex::new(Store::new(ServerState::new(options))));

    let engine_ctx = Arc::new(EngineContext::new(store, io));

    let mut bootstrap = engines::bootstrap::start(engine_ctx.clone());
    let mut api = engines::api::start(engine_ctx.clone());
    let paperclip = engines::paperclip::start(engine_ctx.clone());
    let state = engines::state::start(engine_ctx.clone());

    bootstrap.await?;
    state.await?;
    paperclip.await?;
    api.await?;

    Ok(())
}
