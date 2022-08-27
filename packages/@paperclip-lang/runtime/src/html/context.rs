use super::virt;
use crate::core::virt::Value;
use paperclip_parser::graph::graph;
use std::cell::RefCell;
use std::rc::Rc;

pub struct DocumentContext<'path, 'graph> {
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub data: Option<Value>,
    pub document: Rc<RefCell<virt::Document>>,
}

impl<'path, 'graph> DocumentContext<'path, 'graph> {
    pub fn new(path: &'path str, graph: &'graph graph::Graph) -> Self {
        Self {
            graph,
            path,
            data: None,
            document: Rc::new(RefCell::new(virt::Document {
                source_id: graph
                    .dependencies
                    .get(path)
                    .and_then(|dep| Some(dep.document.id.to_string())),
                children: vec![],
            })),
        }
    }
    pub fn with_data(&self, data: Value) -> Self {
        Self {
            data: Some(data),
            graph: self.graph,
            path: self.path,
            document: self.document.clone(),
        }
    }
}
