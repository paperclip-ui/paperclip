// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
pub use super::core::{ServerState, StartOptions};
use super::engines;
use futures::join;
use std::sync::Arc;

#[tokio::main]
pub async fn start(options: StartOptions) -> Result<(), Box<dyn std::error::Error>> {
    let state = Arc::new(ServerState::new(options));

    let api = engines::api::start(state);

    join!(api);

    Ok(())
}
