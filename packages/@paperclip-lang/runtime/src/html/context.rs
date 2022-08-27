use super::virt;
use crate::core::virt as core_virt;
use paperclip_parser::graph::graph;
use std::cell::RefCell;
use std::rc::Rc;

pub struct DocumentContext<'path, 'graph> {
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub data: Option<RefCell<core_virt::Object>>,
}

impl<'path, 'graph> DocumentContext<'path, 'graph> {
    pub fn new(path: &'path str, graph: &'graph graph::Graph) -> Self {
        Self {
            graph,
            path,
            data: None,
        }
    }
    pub fn with_data(&self, data: core_virt::Object) -> Self {
        Self {
            data: Some(RefCell::new(data)),
            graph: self.graph,
            path: self.path,
        }
    }
}
