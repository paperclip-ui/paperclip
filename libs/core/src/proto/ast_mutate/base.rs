use std::cell::RefCell;
use std::rc::Rc;

use paperclip_common::id::IDGenerator;
use paperclip_proto::ast::expr_map::ExprMap;
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::ast_mutate::{self};
use paperclip_proto::{
    ast::{graph::Dependency, graph_ext::Graph},
    ast_mutate::MutationResult,
};

use crate::config::ConfigContext;
pub struct EditContext<Mutation> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub mutation: Mutation,
    pub path: String,
    pub expr_map: Rc<ExprMap>,
    pub graph: Rc<Graph>,
    pub changes: Rc<RefCell<Vec<MutationResult>>>,
    pub post_mutations: Rc<RefCell<Vec<ast_mutate::Mutation>>>,
    pub config_context: ConfigContext,
}

impl<'a, Mutation> EditContext<Mutation> {
    pub fn get_dependency(&self) -> &Dependency {
        self.graph.dependencies.get(&self.path).as_ref().unwrap()
    }
    pub fn add_change(&self, change: MutationResult) {
        self.changes.borrow_mut().push(change);
    }
    pub fn add_changes(&self, changes: Vec<MutationResult>) {
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
            expr_map: self.expr_map.clone(),
            graph: self.graph.clone(),
            changes: self.changes.clone(),
            post_mutations: self.post_mutations.clone(),
            config_context: self.config_context.clone(),
        }
    }
    pub fn add_post_mutation(&self, mutation: ast_mutate::Mutation) {
        self.post_mutations.borrow_mut().push(mutation);
    }
    pub fn new(
        mutation: Mutation,
        path: &str,
        graph: Rc<Graph>,
        config_context: &ConfigContext,
        expr_map: Rc<ExprMap>,
    ) -> EditContext<Mutation> {
        let dep: &Dependency = graph
            .dependencies
            .get(path)
            .as_ref()
            .expect("Dependency must exist(EditContext<Mutation>)");
        let checksum = dep
            .document
            .as_ref()
            .expect("Document must exist (EditContext<Mutation>)")
            .checksum();

        Self {
            mutation,
            post_mutations: Rc::new(RefCell::new(vec![])),
            id_generator: Rc::new(RefCell::new(IDGenerator::new(checksum))),
            expr_map,
            path: path.to_string(),
            graph: graph.clone(),
            changes: Rc::new(RefCell::new(vec![])),
            config_context: config_context.clone(),
        }
    }
}
