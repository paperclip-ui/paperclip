use crate::core::virt as core_virt;
use paperclip_common::fs::FileResolver;
use paperclip_parser::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;

#[derive(Clone)]
pub struct Options {
    pub include_components: bool,
}

#[derive(Clone)]
pub struct DocumentContext<'graph, 'expr, 'file_resolver, FR: FileResolver> {
    pub graph: &'graph graph::Graph,
    pub path: String,
    pub data: Option<RefCell<core_virt::Object>>,
    pub file_resolver: &'file_resolver FR,
    pub current_component: Option<&'expr ast::Component>,
    pub render_scopes: Vec<String>,
    pub options: Options,
}

impl<'graph, 'expr, 'file_resolver, FR: FileResolver>
    DocumentContext<'graph, 'expr, 'file_resolver, FR>
{
    pub fn new(
        path: &str,
        graph: &'graph graph::Graph,
        file_resolver: &'file_resolver FR,
        options: Options,
    ) -> Self {
        Self {
            graph,
            path: path.to_string(),
            data: None,
            file_resolver,
            options,
            current_component: None,
            render_scopes: vec![],
        }
    }
    pub fn with_data(&self, data: core_virt::Object) -> Self {
        let mut clone = self.clone();
        clone.data = Some(RefCell::new(data));
        clone
    }
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        let mut clone = self.clone();
        clone.current_component = Some(component);
        clone
    }
    pub fn within_path(&self, path: &str) -> Self {
        let mut clone = self.clone();
        clone.path = path.to_string();
        clone
    }
    pub fn set_render_scope(&self, scope: Vec<String>) -> Self {
        let mut clone = self.clone();
        clone.render_scopes = scope;
        clone
    }
}
