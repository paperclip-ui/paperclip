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
    DependencyGraphLoaded { graph: Graph },
}

pub struct ServerState {
    pub options: StartOptions,
    pub graph: Graph,
}

pub struct ServerStore {
    events: EventBus<ServerEvent>,
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
    pub fn emit(&self, event: ServerEvent) {
        self.events.emit(event)
    }
    pub fn subscribe(&mut self) -> crossbeam_channel::Receiver<ServerEvent> {
        self.events.subscribe()
    }
}
