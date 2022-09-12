use super::virt;
use crate::base::types::AssetResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone, Copy)]
pub enum CurrentNode<'expr> {
    Element(&'expr ast::Element),
    TextNode(&'expr ast::TextNode)
}

impl<'expr> CurrentNode<'expr> {
    pub fn get_name(&self) -> &Option<String>{
        match self {
            CurrentNode::Element(expr) => &expr.name,
            CurrentNode::TextNode(expr) => &expr.name,
        }
    }
    pub fn get_id(&self) -> &String {
        match self {
            CurrentNode::Element(expr) => &expr.id,
            CurrentNode::TextNode(expr) => &expr.id,
        }
    }
}

pub struct DocumentContext<'path, 'graph, 'expr> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub resolve_asset: Rc<Box<AssetResolver>>,
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub current_node: Option<CurrentNode<'expr>>,
    pub current_component: Option<&'expr ast::Component>,
    pub document: Rc<RefCell<virt::Document>>,
}

impl<'path, 'graph, 'expr, 'resolve_asset> DocumentContext<'path, 'graph, 'expr> {
    pub fn new(
        path: &'path str,
        graph: &'graph graph::Graph,
        resolve_asset: Rc<Box<AssetResolver>>,
    ) -> Self {
        let document_id = get_document_id(path);
        let id_generator = Rc::new(RefCell::new(IDGenerator::new(document_id)));

        let document_id = id_generator.borrow_mut().new_id();

        Self {
            id_generator: id_generator.clone(),
            resolve_asset,
            graph,
            path,
            current_component: None,
            current_node: None,
            document: Rc::new(RefCell::new(virt::Document {
                id: document_id,
                rules: vec![],
            })),
        }
    }

    pub fn within_document(&self, document_path: &'path str) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            resolve_asset: self.resolve_asset.clone(),
            path: document_path,
            graph: self.graph,
            current_node: self.current_node,
            current_component: self.current_component,
            document: self.document.clone(),
        }
    }

    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            resolve_asset: self.resolve_asset.clone(),
            graph: self.graph,
            path: self.path,
            current_node: self.current_node,
            current_component: Some(component),
            document: self.document.clone(),
        }
    }
    pub fn within_node(&self, node: CurrentNode<'expr>) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            resolve_asset: self.resolve_asset.clone(),
            graph: self.graph,
            path: self.path,
            current_node: Some(node),
            current_component: self.current_component,
            document: self.document.clone(),
        }
    }

    pub fn next_id(&mut self) -> String {
        self.id_generator.borrow_mut().new_id()
    }
}
