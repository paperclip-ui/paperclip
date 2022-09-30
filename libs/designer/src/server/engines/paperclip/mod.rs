use anyhow::Result;
use std::sync::Arc;
use tokio::join;
use paperclip_evaluator::html;
use paperclip_evaluator::css;


use crate::handle_store_event;
use futures::lock::{Mutex, MutexGuard};

use crate::server::{
    core::{ServerEvent, ServerState},
    io::ServerIO,
    ServerStore,
};

#[derive(Clone)]
pub struct PaperclipEngine<TIO: ServerIO> {
    store: Arc<Mutex<ServerStore>>,
    io: Arc<TIO>,
}

impl<TIO: ServerIO> PaperclipEngine<TIO> {
    pub fn new(store: Arc<Mutex<ServerStore>>, io: Arc<TIO>) -> Self {
        Self { store, io }
    }
    pub async fn start(self: Arc<Self>) -> Result<()> {
        // handlers
        join!(self.clone().handle_loaded_designer_files());

        // init
        join!(self.clone().load_files());
        Ok(())
    }

    pub async fn handle_loaded_designer_files(self: Arc<Self>) {
      let next = self.clone();
        handle_store_event!(&self.store, ServerEvent::PaperclipFilesLoaded { files } => {
          next.load_dependency_graph(files);
        });
    }

    async fn load_dependency_graph(self: Arc<Self>, files: Vec<String>) -> Result<()> {
      
    }

    // async fn evaluate_files(&self, files: Vec<String>) -> Result<()> {
    //     for file in files {
    //       let css_virt = css::evaluator::evaluate(&path, graph, file_resolver)
    //     }
    //     Ok(())
    // }

    async fn load_files(self: Arc<Self>) -> Result<()> {
        println!("Loading Paperclip files");
        let state = self.get_store().await.state.options.config_context.clone();
        let files = self.io.get_all_designer_files(&state);
        self.emit(ServerEvent::PaperclipFilesLoaded { files }).await;
        Ok(())
    }

    async fn get_store(&self) -> MutexGuard<'_, ServerStore> {
        self.store.lock().await
    }
    async fn emit(&self, event: ServerEvent) {
        self.get_store().await.events.emit(event)
    }
}
