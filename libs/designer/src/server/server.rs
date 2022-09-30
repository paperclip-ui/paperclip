// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
pub use super::core::{ServerStore, StartOptions};
use super::{engines, io::ServerIO};
use anyhow::Result;
use futures::lock::Mutex;
use std::sync::Arc;

#[tokio::main]
pub async fn start<IO: ServerIO>(
    options: StartOptions,
    io: IO,
) -> Result<(), Box<dyn std::error::Error>> {
    let io = Arc::new(io);
    let state = Arc::new(Mutex::new(ServerStore::new(options)));

    let mut bootstrap = engines::bootstrap::BootstrapEngine::new(state.clone());
    let mut api = engines::api::APIEngine::new(state.clone());
    let mut paperclip = Arc::new(engines::paperclip::PaperclipEngine::new(
        state.clone(),
        io.clone(),
    ));

    bootstrap.prepare().await?;
    paperclip.start().await?;
    api.start().await?;

    Ok(())
}
