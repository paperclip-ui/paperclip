use super::virt;
use anyhow::Result;
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;

pub async fn evaluate(path: &str, graph: &graph::Graph) {
    if let Some(dep) = graph.dependencies.lock().await.get(path) {
        evaluate_document(&dep.document)
    }
}

fn evaluate_document(document: &ast::Document) {

    // TODO - emit style rule
    println!("{:?}", document);
}
