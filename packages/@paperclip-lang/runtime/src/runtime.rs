use paperclip_parser::graph::graph;
use crate::css::virt as css_virt;
use crate::html::virt as html_virt;

pub struct EvaluatedDocument {

    // Path of the dependency that was evaluated
    path: String,

    // CSS of the document created
    sheet: css_virt::Document,

    // Preview HTML of the document evaluated
    body: html_virt::Document
}

pub struct Runtime {
    graph: graph::Graph
}

pub trait RuntimeIO: graph::IO {}

impl Runtime {
    pub fn new() -> Self {
        Runtime {
            graph: graph::Graph::new(),
        }
    }
    pub async fn load<TRuntimeIO: RuntimeIO>(&mut self, path: &str, io: &TRuntimeIO) {
        // First need to load the graph
        let mut graph = graph::Graph::new();
        graph.load(path, io).await;

        // Todo: return { document }
    }
}
