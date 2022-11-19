pub use paperclip_parser::graph;
pub use paperclip_proto::ast_mutate::Mutation;
use paperclip_proto::ast_mutate::MutationResult;
pub use paperclip_proto_ext::ast::all::{Visitable, VisitorResult};

pub fn edit_graph(graph: &mut graph::Graph, mutations: &Vec<Mutation>) -> Vec<(String, Vec<MutationResult>)> {
    let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            if let VisitorResult::Return(changes) = dep.document.accept(&mut mutation.clone()) {
                changed.push((path.to_string(), changes));
            }
        }
    }
    return changed;
}
