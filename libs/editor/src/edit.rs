pub use paperclip_parser::graph;
pub use paperclip_proto::ast_mutate::Mutation;
pub use paperclip_proto_ext::ast::all::{Visitable, VisitorResult};

pub fn edit_graph(graph: &mut graph::Graph, mutations: &Vec<Mutation>) -> Vec<String> {
    let mut changed: Vec<String> = vec![];

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            if matches!(
                dep.document.accept(&mut mutation.clone()),
                VisitorResult::Stop
            ) {
                changed.push(path.to_string());
            }
        }
    }
    return changed;
}
