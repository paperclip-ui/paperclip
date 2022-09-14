use paperclip_parser::graph;
use paperclip_parser::graph::io as graph_io;

pub struct Runtime {}

pub trait RuntimeIO: graph_io::IO {}

impl Runtime {
    pub fn new() -> Self {
        Runtime {}
    }
    pub async fn load<TRuntimeIO: RuntimeIO>(&mut self, path: &str, io: &TRuntimeIO) {
        // First need to load the graph
        let mut graph = graph::Graph::new();
        graph.load(path, io).await;
    }
}
