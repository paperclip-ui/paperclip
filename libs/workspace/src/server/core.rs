use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::EventHandler;
use crate::machine::store::Store;
use anyhow::{Error, Result};
use paperclip_common::fs::FileWatchEvent;
use paperclip_common::get_or_short;
use paperclip_config::ConfigContext;
use paperclip_editor::edit_graph;
use paperclip_editor::Mutation;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::graph::Graph;
use paperclip_parser::pc::serializer::serialize;
use paperclip_proto::ast_mutate::MutationResult;
use paperclip_proto::virt::module::pc_module_import;
use paperclip_proto::virt::module::{GlobalScript, PcModule, PcModuleImport, PccssImport};

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
    GlobalScriptsLoaded(Vec<(String, Vec<u8>)>),
    UpdateFileRequested { path: String, content: Vec<u8> },
    ApplyMutationRequested { mutations: Vec<Mutation> },
    PaperclipFilesLoaded { files: Vec<String> },
    DependencyGraphLoaded { graph: Graph },
    ModulesEvaluated(HashMap<String, (css::virt::Document, html::virt::Document)>),
}

pub struct ServerState {
    pub file_cache: HashMap<String, Vec<u8>>,
    pub options: StartOptions,
    pub latest_ast_changes: Vec<MutationResult>,
    pub graph: Graph,
    pub evaluated_modules: HashMap<String, (css::virt::Document, html::virt::Document)>,
    pub updated_files: Vec<String>,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            options,
            file_cache: HashMap::new(),
            graph: Graph::new(),
            evaluated_modules: HashMap::new(),
            latest_ast_changes: vec![],
            updated_files: vec![],
        }
    }

    // TODO - this needs to be moved to PC runtime instead
    pub fn bundle_evaluated_module(&self, path: &str) -> Result<PcModule> {
        let (css, html) = get_or_short!(
            self.evaluated_modules.get(path),
            Err(Error::msg(format!("File not evaluated yet {}", path)))
        );

        let mut imported: HashSet<String> = HashSet::new();
        let mut to_import: Vec<String> = vec![path.to_string()];
        let mut imports = vec![];

        while let Some(path) = to_import.pop() {
            let dep = self.graph.dependencies.get(&path).unwrap();

            for (_rel, path) in &dep.imports {
                if !imported.contains(path) {
                    imported.insert(path.to_string());
                    to_import.push(path.to_string());
                }

                if let Some((css, _)) = self.evaluated_modules.get(path) {
                    imports.push(PcModuleImport {
                        inner: Some(pc_module_import::Inner::Css(PccssImport {
                            path: path.to_string(),
                            css: Some(css.clone()),
                        })),
                    })
                }
            }
        }

        imports.extend(
            self.options
                .config_context
                .get_global_script_paths()
                .iter()
                .filter_map(|path| {
                    Some(PcModuleImport {
                        inner: Some(pc_module_import::Inner::GlobalScript(GlobalScript {
                            path: path.to_string(),
                            content: self.file_cache.get(path).and_then(|content| {
                                Some(std::str::from_utf8(content).unwrap().to_string())
                            }),
                        })),
                    })
                })
                .collect::<Vec<PcModuleImport>>(),
        );

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
            ServerEvent::ApplyMutationRequested { mutations } => {
                let changed_files = edit_graph(&mut state.graph, mutations);
                println!("Applying {:?}", mutations);
                let mut latest_ast_changes = vec![];
                for (path, changes) in &changed_files {
                    latest_ast_changes.extend(changes.clone());
                    let content = serialize(&state.graph.dependencies.get(path).unwrap().document);
                    state
                        .file_cache
                        .insert(path.to_string(), content.as_bytes().to_vec());
                }

                // state.updated_files = changed_files;
                state.latest_ast_changes = latest_ast_changes;
            }
            ServerEvent::FileWatchEvent(event) => {
                state.file_cache.remove(&event.path);
            }
            ServerEvent::ModulesEvaluated(modules) => {
                state.evaluated_modules.extend(modules.clone());
            }
            ServerEvent::GlobalScriptsLoaded(global_scripts) => {
                for (path, content) in global_scripts {
                    state.file_cache.insert(path.to_string(), content.clone());
                }
            }
            _ => {}
        }
    }
}

pub type ServerEngineContext<TIO> =
    Arc<EngineContext<ServerState, ServerEvent, TIO, ServerStateEventHandler>>;
pub type ServerStore = Store<ServerState, ServerEvent, ServerStateEventHandler>;
