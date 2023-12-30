use std::cell::RefCell;
use std::rc::Rc;

use paperclip_common::id::IDGenerator;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{self};
use paperclip_proto::{
    ast::{graph::Dependency, graph_ext::Graph},
    ast_mutate::MutationResult,
};
pub struct EditContext<Mutation> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub mutation: Mutation,
    pub path: String,
    pub graph: Rc<Graph>,
    pub changes: Rc<RefCell<Vec<MutationResult>>>,
    pub post_mutations: Rc<RefCell<Vec<ast_mutate::Mutation>>>,
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
    pub fn new_id(&self) -> String {
        self.id_generator.borrow_mut().new_id()
    }
    pub fn with_mutation<SubMutation>(&self, mutation: SubMutation) -> EditContext<SubMutation> {
        EditContext {
            mutation,
            id_generator: self.id_generator.clone(),
            path: self.path.clone(),
            graph: self.graph.clone(),
            changes: self.changes.clone(),
            post_mutations: self.post_mutations.clone(),
        }
    }
    pub fn add_post_mutation(&mut self, mutation: ast_mutate::Mutation) {
        self.post_mutations.borrow_mut().push(mutation);
    }
    pub fn new(mutation: Mutation, path: &str, graph: Rc<Graph>) -> EditContext<Mutation> {
        let dep: &Dependency = graph
            .dependencies
            .get(path)
            .as_ref()
            .expect("Dependency must exist");
        let checksum = dep
            .document
            .as_ref()
            .expect("Document must exist")
            .checksum();

        Self {
            mutation,
            post_mutations: Rc::new(RefCell::new(vec![])),
            id_generator: Rc::new(RefCell::new(IDGenerator::new(checksum))),
            path: path.to_string(),
            graph: graph.clone(),
            changes: Rc::new(RefCell::new(vec![])),
        }
    }
}
