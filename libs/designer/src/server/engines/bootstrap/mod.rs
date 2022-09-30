use anyhow::Result;
use futures::{executor::block_on, lock::Mutex};
use std::sync::Arc;

use crate::server::{core::ServerEvent, ServerStore};

pub struct BootstrapEngine {
    store: Arc<Mutex<ServerStore>>,
}

impl BootstrapEngine {
    pub fn new(store: Arc<Mutex<ServerStore>>) -> Self {
        Self { store }
    }
    pub async fn prepare(&mut self) -> Result<()> {
        let store = self.store.clone();
        let chan = store.lock().await.events.subscribe();

        tokio::spawn(async move {
            while let Ok(event) = chan.recv() {
                match event {
                    ServerEvent::APIServerStarted { port } => {
                        if store.lock().await.state.options.open {
                            open::that(format!("http://localhost:{}", port)).unwrap();
                        }
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }
}
