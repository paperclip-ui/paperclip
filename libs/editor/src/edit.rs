pub use paperclip_proto::ast::graph_ext as graph;
pub use paperclip_proto::ast_mutate::Mutation;
use paperclip_proto::ast_mutate::MutationResult;
pub use paperclip_proto_ext::ast::all::{Visitable, VisitorResult};
pub use paperclip_proto_ext::ast_mutate::EditContext;

pub fn edit_graph(
    graph: &mut graph::Graph,
    mutations: &Vec<Mutation>,
) -> Vec<(String, Vec<MutationResult>)> {
    let mut changed: Vec<(String, Vec<MutationResult>)> = vec![];

    for mutation in mutations {
        for (path, dep) in &mut graph.dependencies {
            let mut ctx = EditContext {
                mutation,
                dependency: dep.clone(),
                changes: vec![],
            };
            dep.document
                .as_mut()
                .expect("Document must exist")
                .accept(&mut ctx);

            if ctx.changes.len() > 0 {
                changed.push((path.to_string(), ctx.changes.clone()));
            }
        }
    }
    return changed;
}
