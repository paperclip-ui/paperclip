use anyhow::Result;
use paperclip_common::fs::FileResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_parser::graph;
use paperclip_parser::pc::ast;
use paperclip_proto::virt::css::Rule;
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

#[derive(PartialEq)]
pub struct PrioritizedRule {
    pub priority: u8,
    pub rule: Rule,
}

impl PartialOrd for PrioritizedRule {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.priority.cmp(&other.priority))
    }
}

#[derive(Clone)]
pub struct DocumentContext<'graph, 'expr, 'resolve_asset, FR: FileResolver> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub file_resolver: &'resolve_asset FR,
    pub graph: &'graph graph::Graph,
    pub path: String,
    pub current_node: Option<CurrentNode<'expr>>,
    pub current_instance: Option<&'expr ast::Element>,
    pub current_component: Option<&'expr ast::Component>,
    pub current_shadow: Option<&'expr ast::Component>,
    // pub document: Rc<RefCell<virt::Document>>,

    // for overrides
    pub priority: u8,
    pub rules: Rc<RefCell<Vec<PrioritizedRule>>>,
    pub variant_override: Option<&'expr ast::Variant>,
}

impl<'graph, 'expr, 'resolve_asset, FR: FileResolver>
    DocumentContext<'graph, 'expr, 'resolve_asset, FR>
{
    pub fn new(path: &str, graph: &'graph graph::Graph, file_resolver: &'resolve_asset FR) -> Self {
        let document_id = get_document_id(path);
        let id_generator = Rc::new(RefCell::new(IDGenerator::new(document_id)));

        Self {
            id_generator: id_generator.clone(),
            file_resolver,
            graph,
            path: path.to_string(),
            current_component: None,
            variant_override: None,
            current_node: None,
            current_shadow: None,
            current_instance: None,
            rules: Rc::new(RefCell::new(vec![])),
            priority: 8,
        }
    }

    pub fn resolve_asset(&self, asset_path: &str) -> Result<String> {
        self.file_resolver.resolve_file(&self.path, asset_path)
    }

    pub fn within_shadow(&self, component: &'expr ast::Component) -> Self {
        let mut clone: DocumentContext<FR> = self.clone();
        clone.current_shadow = Some(component);
        clone
    }

    pub fn within_instance(&self, instance: &'expr ast::Element) -> Self {
        let mut clone: DocumentContext<FR> = self.clone();
        clone.current_instance = Some(instance);
        clone
    }

    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        let mut clone: DocumentContext<FR> = self.clone();
        clone.current_component = Some(component);
        clone
    }

    pub fn with_priority(&self, priority: u8) -> Self {
        let mut clone = self.clone();
        clone.priority = priority;
        clone
    }

    pub fn with_variant_override(&self, variant_override: &'expr ast::Variant) -> Self {
        let mut clone = self.clone();
        clone.variant_override = Some(variant_override);
        clone
    }

    pub fn within_path(&self, path: &str) -> Self {
        let mut clone = self.clone();
        clone.path = path.to_string();
        clone
    }

    pub fn within_node(&self, node: CurrentNode<'expr>) -> Self {
        let mut clone = self.clone();
        clone.current_node = Some(node);
        clone
    }

    pub fn next_id(&mut self) -> String {
        self.id_generator.borrow_mut().new_id()
    }

    pub fn get_target_style_component(&self) -> Option<&'expr ast::Component> {
        self.current_shadow.or(self.current_component)
    }

    pub fn get_target_root_node(&self) -> Option<&'expr ast::Render> {
        self.get_target_style_component()
            .and_then(|component| component.get_render_expr())
    }

    pub fn is_target_node_root(&self) -> bool {
        if let Some(root) = self.get_target_root_node() {
            if let Some(current_node) = self.current_node {
                return root.node.as_ref().expect("Node must exist").get_id()
                    == current_node.get_id();
            }
        }
        return false;
    }

    pub fn get_scoped_variant(&self, name: &str) -> Option<&'expr ast::Variant> {
        if let Some(variant_override) = self.variant_override {
            if variant_override.name == name {
                return Some(variant_override);
            }
        }
        return self
            .current_component
            .and_then(|component| component.get_variant(name));
    }
}
