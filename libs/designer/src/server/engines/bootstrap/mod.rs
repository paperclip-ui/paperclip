use crate::handle_store_events;
use anyhow::Result;
use parking_lot::Mutex;
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
        handle_store_events!(store, ServerEvent::APIServerStarted { port } => {
            if store.lock().state.options.open {
                open::that(format!("http://localhost:{}", port)).unwrap();
            }
        });
        Ok(())
    }
}
