use super::virt;
use anyhow::Result;
use paperclip_common::fs::FileResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_parser::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone, Copy)]
pub enum CurrentNode<'expr> {
    Element(&'expr ast::Element),
    TextNode(&'expr ast::TextNode),
}

impl<'expr> CurrentNode<'expr> {
    pub fn get_name(&self) -> &Option<String> {
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

pub struct DocumentContext<'path, 'graph, 'expr, 'resolve_asset, FR: FileResolver> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub file_resolver: &'resolve_asset FR,
    pub graph: &'graph graph::Graph,
    pub path: &'path str,
    pub current_node: Option<CurrentNode<'expr>>,
    pub current_component: Option<&'expr ast::Component>,
    pub document: Rc<RefCell<virt::Document>>,
}

impl<'path, 'graph, 'expr, 'resolve_asset, FR: FileResolver>
    DocumentContext<'path, 'graph, 'expr, 'resolve_asset, FR>
{
    pub fn new(
        path: &'path str,
        graph: &'graph graph::Graph,
        file_resolver: &'resolve_asset FR,
    ) -> Self {
        let document_id = get_document_id(path);
        let id_generator = Rc::new(RefCell::new(IDGenerator::new(document_id)));

        let document_id = id_generator.borrow_mut().new_id();

        Self {
            id_generator: id_generator.clone(),
            file_resolver,
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

    pub fn resolve_asset(&self, asset_path: &str) -> Result<String> {
        self.file_resolver.resolve_file(&self.path, asset_path)
    }

    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            id_generator: self.id_generator.clone(),
            file_resolver: self.file_resolver,
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
            file_resolver: self.file_resolver,
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
