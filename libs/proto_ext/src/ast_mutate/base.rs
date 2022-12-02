use paperclip_proto::ast::graph::Dependency;
pub struct EditContext<'a, T> {
    pub mutation: &'a T,
    pub dependency: Dependency,
}
