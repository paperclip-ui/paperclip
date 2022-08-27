use super::virt;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::rc::Rc;

pub struct DocumentContext<'path, 'graph, 'expr> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub current_element: Option<&'expr ast::Element>,
    pub current_component: Option<&'expr ast::Component>,
    pub document: Rc<RefCell<virt::Document>>,
}

impl<'path, 'graph, 'expr> DocumentContext<'path, 'graph, 'expr> {
    pub fn new(path: &'path str, graph: &'graph graph::Graph) -> Self {
        let document_id = get_document_id(path);
        let id_generator = Rc::new(RefCell::new(IDGenerator::new(document_id)));

        Self {
            id_generator: id_generator.clone(),
            graph,
            path,
            current_component: None,
            current_element: None,
            document: Rc::new(RefCell::new(virt::Document {
                source_id: graph
                    .dependencies
                    .get(path)
                    .and_then(|dep| Some(dep.document.id.to_string())),
                children: vec![],
            })),
        }
    }

    pub fn within_document(&self, document_path: &'path str) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            path: document_path,
            graph: self.graph,
            current_element: self.current_element,
            current_component: self.current_component,
            document: self.document.clone(),
        }
    }

    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            graph: self.graph,
            path: self.path,
            current_element: self.current_element,
            current_component: Some(component),
            document: self.document.clone(),
        }
    }
    pub fn within_element(&self, element: &'expr ast::Element) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            graph: self.graph,
            path: self.path,
            current_element: Some(element),
            current_component: self.current_component,
            document: self.document.clone(),
        }
    }

    pub fn next_id(&mut self) -> String {
        self.id_generator.borrow_mut().new_id()
    }
}
