use super::virt;
use crate::core::virt as core_virt;
// use paperclip_common::id::{IDGenerator, get_document_id};
use paperclip_common::fs::FileResolver;
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone)]
pub struct Options {
    pub include_components: bool,
}

pub struct DocumentContext<'path, 'graph, 'expr, 'file_resolver, FR: FileResolver> {
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub data: Option<RefCell<core_virt::Object>>,
    pub file_resolver: &'file_resolver FR,
    pub current_component: Option<&'expr ast::Component>,
    pub options: Options,
}

impl<'path, 'graph, 'expr, 'file_resolver, FR: FileResolver>
    DocumentContext<'path, 'graph, 'expr, 'file_resolver, FR>
{
    pub fn new(
        path: &'path str,
        graph: &'graph graph::Graph,
        file_resolver: &'file_resolver FR,
        options: Options,
    ) -> Self {
        Self {
            graph,
            path,
            data: None,
            file_resolver,
            options,
            current_component: None,
        }
    }
    pub fn with_data(&self, data: core_virt::Object) -> Self {
        Self {
            data: Some(RefCell::new(data)),
            graph: self.graph,
            path: self.path,
            file_resolver: self.file_resolver,
            current_component: self.current_component,
            options: self.options.clone(),
        }
    }
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            data: self.data.clone(),
            graph: self.graph,
            path: self.path,
            file_resolver: self.file_resolver,
            current_component: Some(component),
            options: self.options.clone(),
        }
    }
}
