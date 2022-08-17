use paperclip_parser::graph::graph;

pub struct EvaluatedDocument {
    // Path to the dependency
    path: String,
}

pub struct Runtime {
    graph: graph::Graph,
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
    }
}
