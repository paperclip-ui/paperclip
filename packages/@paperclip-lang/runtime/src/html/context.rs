use super::virt;
use crate::core::virt as core_virt;
// use paperclip_common::id::{IDGenerator, get_document_id};
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::rc::Rc;
use crate::base::types::AssetResolver;

pub struct DocumentContext<'path, 'graph, 'expr> {
    pub resolve_asset: Rc<Box<AssetResolver>>,
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub data: Option<RefCell<core_virt::Object>>,
    pub current_component: Option<&'expr ast::Component>,
}

impl<'path, 'graph, 'expr> DocumentContext<'path, 'graph, 'expr> {
    pub fn new(path: &'path str, graph: &'graph graph::Graph, resolve_asset: Box<AssetResolver>) -> Self {
        Self {
            graph,
            path,
            data: None,
            resolve_asset: Rc::new(resolve_asset),
            current_component: None,
        }
    }
    pub fn with_data(&self, data: core_virt::Object) -> Self {
        Self {
            data: Some(RefCell::new(data)),
            resolve_asset: self.resolve_asset.clone(),
            graph: self.graph,
            path: self.path,
            current_component: self.current_component,
        }
    }
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            data: self.data.clone(),
            resolve_asset: self.resolve_asset.clone(),
            graph: self.graph,
            path: self.path,
            current_component: Some(component),
        }
    }
}
