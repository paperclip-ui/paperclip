use paperclip_common::event_bus::EventBus;
use paperclip_config::ConfigContext;
use paperclip_parser::graph::Graph;

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

#[derive(Clone, Debug)]
pub enum ServerEvent {
    DependencyChanged { path: String },
    APIServerStarted { port: u16 },
    PaperclipFilesLoaded { files: Vec<String> },
}

pub struct ServerState {
    pub options: StartOptions,
    pub graph: Graph,
}

pub struct ServerStore {
    pub events: EventBus<ServerEvent>,
    pub state: ServerState,
}

impl ServerStore {
    pub fn new(options: StartOptions) -> Self {
        Self {
            events: EventBus::new(),
            state: ServerState {
                graph: Graph::new(),
                options,
            },
        }
    }
}
