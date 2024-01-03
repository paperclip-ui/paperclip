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
    pub ctx_name: String,
    pub options: Options,
}

#[derive(Clone)]
pub struct Options {
    pub use_exact_imports: bool,
}

impl<'dependency> Context<'dependency> {
    pub fn new(
        dependency: &'dependency Dependency,
        graph: &'dependency Graph,
        options: Options,
    ) -> Self {
        Self {
            content: Rc::new(RefCell::new(SerializeContext::new(0))),
            current_component: None,
            options,
            graph,
            dependency,
            ctx_name: "props".to_string(),
        }
    }
    pub fn within_component(&self, component: &'dependency ast::pc::Component) -> Self {
        let mut clone = self.clone();
        clone.current_component = Some(component);
        clone
    }
    pub fn with_ctx_name(&self, name: &str) -> Self {
        let mut clone = self.clone();
        clone.ctx_name = name.to_string();
        clone
    }
    pub fn add_buffer(&self, buffer: &str) {
        self.content.borrow_mut().add_buffer(buffer);
    }
    pub fn replace_buffer(&self, buffer: &str) {
        self.content.borrow_mut().replace_buffer(buffer);
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
