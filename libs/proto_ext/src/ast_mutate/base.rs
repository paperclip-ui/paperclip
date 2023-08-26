use std::cell::RefCell;
use std::rc::Rc;

use paperclip_proto::{
    ast::{graph::Dependency, graph_ext::Graph},
    ast_mutate::MutationResult,
};
pub struct EditContext<Mutation> {
    pub mutation: Mutation,
    pub path: String,
    pub graph: Rc<Graph>,
    pub changes: Rc<RefCell<Vec<MutationResult>>>,
}

impl<'a, Mutation> EditContext<Mutation> {
    pub fn get_dependency(&self) -> &Dependency {
        self.graph.dependencies.get(&self.path).as_ref().unwrap()
    }
    pub fn add_change(&mut self, change: MutationResult) {
        self.changes.borrow_mut().push(change);
    }
    pub fn add_changes(&mut self, changes: Vec<MutationResult>) {
        self.changes.borrow_mut().extend(changes);
    }
    pub fn with_mutation<SubMutation>(&self, mutation: SubMutation) -> EditContext<SubMutation> {
        EditContext {
            mutation,
            path: self.path.clone(),
            graph: self.graph.clone(),
            changes: self.changes.clone(),
        }
    }
    pub fn new(mutation: Mutation, path: &str, graph: Rc<Graph>) -> EditContext<Mutation> {
        Self {
            mutation,
            path: path.to_string(),
            graph: graph.clone(),
            changes: Rc::new(RefCell::new(vec![])),
        }
    }
}
