use paperclip_common::fs::FileWatchEvent;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast_mutate::MutationResult;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum ServerEvent {
    Initialized,
    FileWatchEvent(FileWatchEvent),
    DependencyChanged {
        path: String,
    },
    APIServerStarted {
        port: u16,
    },
    GlobalScriptsLoaded(Vec<(String, Vec<u8>)>),
    UpdateFileRequested {
        path: String,
        content: Vec<u8>,
    },
    UndoRequested,
    RedoRequested,
    ScreenshotCaptured {
        expr_id: String,
    },
    SaveRequested,
    MutationsApplied {
        result: Vec<(String, Vec<MutationResult>)>,
        updated_graph: Graph,
    },
    PaperclipFilesLoaded {
        files: Vec<String>,
    },
    DependencyGraphLoaded {
        graph: Graph,
    },
    ModulesEvaluated(HashMap<String, (css::virt::Document, html::virt::Document)>),
    ScreenshotsStarted,
    ScreenshotsFinished,
}
