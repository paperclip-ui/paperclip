use paperclip_common::serialize_context::Context as SerializeContext;
use paperclip_proto::ast::{
    self,
    graph_ext::{Dependency, Graph},
};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone)]
pub struct Context<'dependency> {
    pub content: Rc<RefCell<SerializeContext>>,
    pub dependency: &'dependency Dependency,
    pub graph: &'dependency Graph,
    pub current_component: Option<&'dependency ast::pc::Component>,
}

impl<'dependency> Context<'dependency> {
    pub fn new(dependency: &'dependency Dependency, graph: &'dependency Graph) -> Self {
        Self {
            content: Rc::new(RefCell::new(SerializeContext::new(0))),
            current_component: None,
            graph,
            dependency,
        }
    }
    pub fn within_component(&self, component: &'dependency ast::pc::Component) -> Self {
        let mut clone = self.clone();
        clone.current_component = Some(component);
        clone
    }
    pub fn add_buffer(&self, buffer: &str) {
        self.content.borrow_mut().add_buffer(buffer);
    }
    pub fn start_block(&self) {
        self.content.borrow_mut().start_block();
    }
    pub fn end_block(&self) {
        self.content.borrow_mut().end_block();
    }
    pub fn get_buffer(&self) -> String {
        self.content.borrow().buffer.to_string()
    }
    pub fn with_new_content(&self) -> Self {
        let mut clone = self.clone();
        clone.content = Rc::new(RefCell::new(SerializeContext::new(
            self.content.borrow().depth,
        )));
        clone
    }
}
