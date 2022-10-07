use std::collections::HashMap;
use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::EventHandler;
use crate::machine::store::Store;
use anyhow::{Error, Result};
use paperclip_common::fs::FileWatchEvent;
use paperclip_common::get_or_short;
use paperclip_config::ConfigContext;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;
use paperclip_proto::virt::module::{PcModule, PcModuleImport};

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

#[derive(Debug, Clone)]
pub enum ServerEvent {
    Initialized,
    FileWatchEvent(FileWatchEvent),
    DependencyChanged { path: String },
    APIServerStarted { port: u16 },
    UpdateFileRequested { path: String, content: Vec<u8> },
    PaperclipFilesLoaded { files: Vec<String> },
    DependencyGraphLoaded { graph: Graph },
    ModulesEvaluated(HashMap<String, (css::virt::Document, html::virt::Document)>),
}

pub struct ServerState {
    pub file_cache: HashMap<String, Vec<u8>>,
    pub options: StartOptions,
    pub graph: Graph,
    pub evaluated_modules: HashMap<String, (css::virt::Document, html::virt::Document)>,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            options,
            file_cache: HashMap::new(),
            graph: Graph::new(),
            evaluated_modules: HashMap::new(),
        }
    }

    // TODO - this needs to be moved to PC runtime instead
    pub fn bundle_evaluated_module(&self, path: &str) -> Result<PcModule> {
        let (css, html) = get_or_short!(
            self.evaluated_modules.get(path),
            Err(Error::msg(format!("File not evaluated yet {}", path)))
        );

        let mut imports = vec![];

        let dep = self.graph.dependencies.get(path).unwrap();

        for (_rel, path) in &dep.imports {
            if let Some((css, _)) = self.evaluated_modules.get(path) {
                imports.push(PcModuleImport {
                    path: path.to_string(),
                    css: Some(css.clone()),
                })
            }
        }

        Ok(PcModule {
            html: Some(html.clone()),
            css: Some(css.clone()),
            imports,
        })
    }
}

#[derive(Default, Clone)]
pub struct ServerStateEventHandler;

impl EventHandler<ServerState, ServerEvent> for ServerStateEventHandler {
    fn handle_event(&self, state: &mut ServerState, event: &ServerEvent) {
        match event {
            ServerEvent::DependencyGraphLoaded { graph } => {
                state.graph =
                    std::mem::replace(&mut state.graph, Graph::new()).merge(graph.clone());
            }
            ServerEvent::UpdateFileRequested { path, content } => {
                state.file_cache.insert(path.to_string(), content.clone());
            }
            ServerEvent::FileWatchEvent(event) => {
                state.file_cache.remove(&event.path);
            }
            ServerEvent::ModulesEvaluated(modules) => {
                state.evaluated_modules.extend(modules.clone());
            }
            _ => {}
        }
    }
}

pub type ServerEngineContext<TIO> =
    Arc<EngineContext<ServerState, ServerEvent, TIO, ServerStateEventHandler>>;
pub type ServerStore = Store<ServerState, ServerEvent, ServerStateEventHandler>;
