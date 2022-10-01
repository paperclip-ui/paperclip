use std::collections::HashMap;
use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::EventHandler;
use crate::machine::store::Store;
use paperclip_config::ConfigContext;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

#[derive(Debug, Clone)]
pub enum ServerEvent {
    DependencyChanged { path: String },
    APIServerStarted { port: u16 },
    PaperclipFilesLoaded { files: Vec<String> },
    DependencyGraphLoaded { graph: Graph },
    ModulesEvaluated(HashMap<String, (css::virt::Document, html::virt::Document)>),
}

pub struct ServerState {
    pub options: StartOptions,
    pub graph: Option<Graph>,
    pub evaluated_modules: Option<HashMap<String, (css::virt::Document, html::virt::Document)>>,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            options,
            graph: None,
            evaluated_modules: None,
        }
    }
}

#[derive(Default, Clone)]
pub struct ServerStateEventHandler;

impl EventHandler<ServerState, ServerEvent> for ServerStateEventHandler {
    fn handle_event(&self, state: &mut ServerState, event: &ServerEvent) {
        match event {
            ServerEvent::DependencyGraphLoaded { graph } => {
                state.graph = Some(graph.clone());
            }
            ServerEvent::ModulesEvaluated(modules) => {
                state.evaluated_modules = Some(modules.clone());
                println!("EVALED");
            }
            _ => {}
        }
    }
}

pub type ServerEngineContext<TIO> =
    Arc<EngineContext<ServerState, ServerEvent, TIO, ServerStateEventHandler>>;
pub type ServerStore = Store<ServerState, ServerEvent, ServerStateEventHandler>;
