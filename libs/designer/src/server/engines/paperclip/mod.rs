use anyhow::Result;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;
use parking_lot::{Mutex, MutexGuard};
use std::sync::Arc;
use tokio::join;

use crate::handle_store_events;

use crate::server::{
    core::{ServerEvent, ServerState},
    io::ServerIO,
    ServerStore,
};

#[derive(Clone)]
pub struct PaperclipEngine<TIO: ServerIO> {
    store: Arc<Mutex<ServerStore>>,
    io: TIO,
}

impl<TIO: ServerIO> PaperclipEngine<TIO> {
    pub fn new(store: Arc<Mutex<ServerStore>>, io: TIO) -> Self {
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
        println!("HANDLE STOR");
        handle_store_events!(&self.store, ServerEvent::PaperclipFilesLoaded { files } => {
          println!("NEXT");
          next.clone().load_dependency_graph(files).await;
        });
    }

    async fn load_dependency_graph(self: Arc<Self>, files: Vec<String>) -> Result<()> {
        // let store = self.store.lock().await;
        let graph = Graph::load_files3(&files, &self.io).await?;

        println!("{:?}", graph);

        self.store
            .lock()
            .emit(ServerEvent::DependencyGraphLoaded { graph });

        // self.store.lock().state.graph.load_files(&files, &self.io).await;

        Ok(())
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
        println!("LOADD");
        self.emit(ServerEvent::PaperclipFilesLoaded { files }).await;
        Ok(())
    }

    async fn get_store(&self) -> MutexGuard<'_, ServerStore> {
        self.store.lock()
    }

    // async fn get_state<'a>(&self) -> &'a ServerState {
    //   self.store.lock().await.state.as_ref()
    // }
    async fn emit(&self, event: ServerEvent) {
        self.get_store().await.emit(event)
    }
}
