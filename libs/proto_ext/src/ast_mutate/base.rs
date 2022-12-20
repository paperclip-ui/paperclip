use std::rc::Rc;

use paperclip_proto::{ast::{graph::Dependency, graph_ext::Graph}, ast_mutate::MutationResult};
pub struct EditContext<'a, T> {
    pub mutation: &'a T,
    pub path: String,
    pub graph: Rc<Graph>,
    pub changes: Vec<MutationResult>,
}


impl<'a, T> EditContext<'a, T> {
    pub fn get_dependency(&self) -> &Dependency {
        self.graph.dependencies.get(&self.path).as_ref().unwrap()
    }
}