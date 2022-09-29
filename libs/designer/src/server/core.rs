use paperclip_common::event_bus::EventBus;
use paperclip_config::ConfigContext;
use paperclip_parser::graph::Graph;

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

#[derive(Clone)]
pub enum ServerEvent {
    DependencyChanged(DependencyChanged),
    APIServerStarted(APIServerStarted),
}

#[derive(Clone)]
pub struct DependencyChanged {
    path: String,
}

#[derive(Clone)]
pub struct APIServerStarted {
    port: u16,
}

pub struct ServerState {
    pub options: StartOptions,
    pub events: EventBus<ServerEvent>,
    pub graph: Graph,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            options,
            events: EventBus::new(),
            graph: Graph::new(),
        }
    }
}
