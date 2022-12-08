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
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_parser::pc::serializer::serialize;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast_mutate::Mutation;
use paperclip_proto::ast_mutate::MutationResult;
use paperclip_proto::virt::module::pc_module_import;
use paperclip_proto::virt::module::{GlobalScript, PcModule, PcModuleImport, PccssImport};
use paperclip_proto_ext::ast_mutate::edit_graph;

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
}

enum HistoryStep {
    Forward,
    Back,
}

#[derive(Debug, Clone)]
pub enum ServerEvent {
    Initialized,
    FileWatchEvent(FileWatchEvent),
    DependencyChanged { path: String },
    APIServerStarted { port: u16 },
    GlobalScriptsLoaded(Vec<(String, Vec<u8>)>),
    UpdateFileRequested { path: String, content: Vec<u8> },
    UndoRequested,
    RedoRequested,
    SaveRequested,
    ApplyMutationRequested { mutations: Vec<Mutation> },
    PaperclipFilesLoaded { files: Vec<String> },
    DependencyGraphLoaded { graph: Graph },
    ModulesEvaluated(HashMap<String, (css::virt::Document, html::virt::Document)>),
}

pub struct History {
    pub changes: Vec<Graph>,
    position: usize,
}

pub struct ServerState {
    pub history: History,
    pub doc_checksums: HashMap<String, String>,
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
            history: History {
                changes: vec![],
                position: 0,
            },
            options,
            doc_checksums: HashMap::new(),
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

                store_history(state);
            }
            ServerEvent::UpdateFileRequested { path, content } => {
                // onyl flag as changed if content actually changed.
                if let Some(existing_content) = state.file_cache.get(path) {
                    if content != existing_content {
                        state.updated_files.push(path.clone());
                    }
                }

                state.file_cache.insert(path.to_string(), content.clone());
            }
            ServerEvent::ApplyMutationRequested { mutations } => {
                let changed_files = edit_graph(&mut state.graph, mutations);
                println!("Applying {:?} {:?}", mutations, changed_files);
                let mut latest_ast_changes = vec![];
                for (path, changes) in &changed_files {
                    latest_ast_changes.extend(changes.clone());
                    println!("CHANGED PATH {}", path);
                }

                // println!("{:?}", changed_files);

                update_changed_files(state);
                store_history(state);

                state.latest_ast_changes = latest_ast_changes;
            }
            ServerEvent::FileWatchEvent(event) => {
                state.file_cache.remove(&event.path);
            }
            ServerEvent::UndoRequested => {
                load_history(state, HistoryStep::Back);
            }
            ServerEvent::RedoRequested => {
                load_history(state, HistoryStep::Forward);
            }
            ServerEvent::ModulesEvaluated(modules) => {
                state.evaluated_modules.extend(modules.clone());
                state.updated_files = vec![];
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

fn store_history(state: &mut ServerState) {
    if state.history.changes.is_empty() {
        state.history.changes.push(state.graph.clone());
        for (key, dep) in &state.graph.dependencies {
            state
                .doc_checksums
                .insert(key.to_string(), dep.document.as_ref().unwrap().checksum());
        }
        return;
    }

    // TODO - probably worth storing this _locally_ to avoid memory issues
    let mut updated_graph = Graph::new();
    for updated_file in &state.updated_files {
        updated_graph.dependencies.insert(
            updated_file.to_string(),
            state.graph.dependencies.get(updated_file).unwrap().clone(),
        );
        println!("Storing {} in history", updated_file);
    }
    if !state.updated_files.is_empty() {
        state.history.changes.truncate(state.history.position + 1);
        state.history.changes.push(updated_graph);
        state.history.position = state.history.changes.len() - 1;
    }
}

fn load_history(state: &mut ServerState, step: HistoryStep) {
    println!(
        "Loading history pos: {}, len: {}",
        state.history.position,
        state.history.changes.len()
    );

    state.updated_files = vec![];

    match step {
        HistoryStep::Forward => {
            if state.history.position >= state.history.changes.len() - 1 {
                return;
            }
        }
        HistoryStep::Back => {
            if state.history.position == 0 {
                return;
            }
        }
    }

    // if it doesn't exist, then we have a bug
    let current = state
        .history
        .changes
        .get(state.history.position)
        .expect("History record must exist!");

    let new_pos = match step {
        HistoryStep::Forward => state.history.position + 1,
        HistoryStep::Back => state.history.position - 1,
    };

    match step {
        HistoryStep::Forward => {
            let next = state
                .history
                .changes
                .get(new_pos)
                .expect("Next history change doesn't exist!");
            for (path, dep) in &next.dependencies {
                state
                    .graph
                    .dependencies
                    .insert(path.to_string(), dep.clone());
            }
        }
        HistoryStep::Back => {
            // revert change to most recent
            for (current_updated_path, _) in &current.dependencies {
                for i in (0..new_pos + 1).rev() {
                    let prev_change = state
                        .history
                        .changes
                        .get(i)
                        .expect("Unable to fetch dep when looking back");
                    if let Some(dep) = prev_change.dependencies.get(current_updated_path) {
                        state
                            .graph
                            .dependencies
                            .insert(current_updated_path.to_string(), dep.clone());
                        break;
                    }
                }
            }
        }
    }

    state.history.position = new_pos;

    update_changed_files(state);
}

fn update_changed_files(state: &mut ServerState) {
    for (path, dep) in &state.graph.dependencies {
        let checksum = dep.document.as_ref().unwrap().checksum();

        if !state.doc_checksums.get(path).eq(&Some(&checksum)) {
            println!("Updating {}", path);
            let content = serialize(dep.document.as_ref().expect("Document must exist"))
                .as_bytes()
                .to_vec();
            state.doc_checksums.insert(path.to_string(), checksum);
            state.updated_files.push(path.to_string());
            state.file_cache.insert(path.to_string(), content);
        }
    }
}

pub type ServerEngineContext<TIO> =
    Arc<EngineContext<ServerState, ServerEvent, TIO, ServerStateEventHandler>>;
pub type ServerStore = Store<ServerState, ServerEvent, ServerStateEventHandler>;
