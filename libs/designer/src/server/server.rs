// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
pub use super::core::{ServerState, StartOptions};
use super::{
    core::ServerEvent,
    core::ServerStateEventHandler,
    engines::{self},
    io::ServerIO,
};
use crate::machine::engine::EngineContext;
use crate::machine::store::Store;
use anyhow::Result;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::join;

macro_rules! start_engines {
    ($ctx: expr, $($engine: path), *) => {

        join!($(
            {
                use $engine as engine;
                engine::prepare($ctx.clone())
            }
        ), *);


        join!($(
            {
                use $engine as base;
                base::start($ctx.clone())
            }
        ), *)
    };
}

#[tokio::main]
pub async fn start<IO: ServerIO>(
    options: StartOptions,
    io: IO,
) -> Result<(), Box<dyn std::error::Error>> {
    let store = Arc::new(Mutex::new(Store::new(
        ServerState::new(options),
        ServerStateEventHandler::default(),
    )));

    let engine_ctx = Arc::new(EngineContext::new(store, io));

    start_engines!(
        engine_ctx.clone(),
        engines::bootstrap,
        engines::config,
        engines::api,
        engines::paperclip
    );

    Ok(())
}
