// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
pub use super::core::{ServerState, StartOptions};
use super::{
    core::ServerStateEventHandler,
    io::ServerIO,
};
use crate::server::domains;
use crate::machine::engine::EngineContext;
use crate::machine::store::Store;
use anyhow::Result;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::try_join;

#[allow(unused_must_use)]
macro_rules! start_engines {
    ($ctx: expr, $($engine: path), *) => {

        try_join!($(
            {
                use $engine as engine;
                engine::prepare($ctx.clone())
            }
        ), *).expect("Unable to prepare");


        try_join!($(
            {
                use $engine as base;
                base::start($ctx.clone())
            }
        ), *).expect("Unable to start");
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
        domains::bootstrap::engine,
        domains::config::engine,
        domains::api::engine,
        domains::paperclip::engine
    );

    Ok(())
}
