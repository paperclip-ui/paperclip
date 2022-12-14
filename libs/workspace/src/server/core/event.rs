use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::EventHandler;
use crate::machine::store::Store;
use anyhow::{Error, Result};
use paperclip_ast_serialize::pc::serialize;
use paperclip_common::fs::FileWatchEvent;
use paperclip_common::get_or_short;
use paperclip_config::ConfigContext;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast_mutate::Mutation;
use paperclip_proto::ast_mutate::MutationResult;
use paperclip_proto::virt::module::pc_module_import;
use paperclip_proto::virt::module::{GlobalScript, PcModule, PcModuleImport, PccssImport};
use paperclip_proto_ext::ast_mutate::edit_graph;


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
