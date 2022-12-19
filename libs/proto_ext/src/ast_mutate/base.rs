use paperclip_proto::{ast::graph::Dependency, ast_mutate::MutationResult};
pub struct EditContext<'a, T> {
    pub mutation: &'a T,
    pub dependency: Dependency,
    pub changes: Vec<MutationResult>,
}
