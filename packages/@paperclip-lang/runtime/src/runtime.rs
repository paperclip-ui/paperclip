use crate::html::virt as html_virt;
use paperclip_css_evaluator::virt as css_virt;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::io as graph_io;

pub struct EvaluatedDocument {
    // Path of the dependency that was evaluated
    path: String,

    // CSS of the document created
    sheet: css_virt::Document,

    // Preview HTML of the document evaluated
    body: html_virt::Document,
}

pub struct Runtime {
    graph: graph::Graph,
}

pub trait RuntimeIO: graph_io::IO {}

impl Runtime {
    pub fn new() -> Self {
        Runtime {
            graph: graph::Graph::new(),
        }
    }
    pub async fn load<TRuntimeIO: RuntimeIO>(&mut self, path: &str, io: &TRuntimeIO) {
        // First need to load the graph
        let mut graph = graph::Graph::new();
        graph.load(path, io);

        // Todo: return { document }
    }
}
