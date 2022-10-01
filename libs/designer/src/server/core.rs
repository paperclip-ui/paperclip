use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::Store;
use crate::server::io::ServerIO;
use paperclip_config::ConfigContext;
use paperclip_parser::graph::Graph;

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

#[derive(Debug)]
pub enum ServerEvent {
    DependencyChanged { path: String },
    APIServerStarted { port: u16 },
    PaperclipFilesLoaded { files: Vec<String> },
    DependencyGraphLoaded { graph: Graph },
}

pub struct ServerState {
    pub options: StartOptions,
    pub graph: Graph,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            options,
            graph: Graph::new(),
        }
    }
}

pub type ServerEngineContext<TIO> = Arc<EngineContext<ServerState, ServerEvent, TIO>>;
pub type ServerStore = Store<ServerState, ServerEvent>;
