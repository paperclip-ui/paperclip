use paperclip_common::{fs::FileResolver, serialize_context::Context as SerializeContext};
use paperclip_proto::ast::{
    self,
    expr_map::ExprMap,
    graph_container::GraphContainer,
    graph_ext::{Dependency, Graph},
};
use std::rc::Rc;
use std::{cell::RefCell, collections::HashMap};

#[derive(Clone)]
pub struct Context<'dependency> {
    graph_container: &'dependency GraphContainer<'dependency>,
    pub content: Rc<RefCell<SerializeContext>>,
    pub dependency: &'dependency Dependency,
    pub current_component: Option<&'dependency ast::pc::Component>,
    pub ctx_name: String,
    pub options: Options,
    pub resolve_files: HashMap<String, String>,
}

#[derive(Clone)]
pub struct Options {
    pub use_exact_imports: bool,
}

impl<'dependency> Context<'dependency> {
    pub fn new(
        dependency: &'dependency Dependency,
        graph_container: &'dependency GraphContainer,
        options: Options,
        resolve_files: HashMap<String, String>,
    ) -> Self {
        Self {
            content: Rc::new(RefCell::new(SerializeContext::new(0))),
            current_component: None,
            options,
            graph_container,
            dependency,
            ctx_name: "props".to_string(),
            resolve_files,
        }
    }
    pub fn graph(&self) -> &Graph {
        &self.graph_container.graph
    }
    pub fn expr_map(&self) -> &ExprMap {
        &self.graph_container.get_expr_map()
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
