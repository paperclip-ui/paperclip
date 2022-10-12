use anyhow::Result;
use paperclip_common::fs::FileResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_parser::graph;
use paperclip_parser::graph::reference::ComponentRefInfo;
use paperclip_parser::pc::ast::{self};
use paperclip_proto::virt::css::Rule;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone, Copy, Debug)]
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

#[derive(PartialEq, Debug)]
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
pub struct DocumentContext<'expr, 'resolve_asset, FR: FileResolver> {
    id_generator: Rc<RefCell<IDGenerator>>,
    pub file_resolver: &'resolve_asset FR,
    pub graph: &'expr graph::Graph,
    pub path: String,

    // the current element in focus, used when style child is on deck
    pub target_node: Option<CurrentNode<'expr>>,

    // current instance, this is necessary in case of overriding deeply nested node
    // pub current_instance: Option<&'expr ast::Element>,

    // Current component that this document is in
    pub current_component: Option<&'expr ast::Component>,

    // for sorting styles (needed for overrides)
    pub priority: u8,

    // all of the styles that are evaluated
    pub rules: Rc<RefCell<Vec<PrioritizedRule>>>,

    // The variant override that's in focus
    pub current_variant: Option<&'expr ast::Variant>,

    // The variant override that's in focus
    pub current_ref_context: Option<Box<DocumentContext<'expr, 'resolve_asset, FR>>>,

    // __parent__ context. This gets assigned when we drill into instances
    pub shadow_of: Option<Box<DocumentContext<'expr, 'resolve_asset, FR>>>,
}

impl<'expr, 'resolve_asset, FR: FileResolver> DocumentContext<'expr, 'resolve_asset, FR> {
    pub fn new(path: &str, graph: &'expr graph::Graph, file_resolver: &'resolve_asset FR) -> Self {
        let document_id = get_document_id(path);
        let id_generator = Rc::new(RefCell::new(IDGenerator::new(document_id)));

        Self {
            id_generator: id_generator.clone(),
            file_resolver,
            graph,
            path: path.to_string(),
            current_component: None,
            current_ref_context: None,
            current_variant: None,
            // current_instance: None,
            target_node: None,
            shadow_of: None,
            rules: Rc::new(RefCell::new(vec![])),
            priority: 0,
        }
    }

    pub fn resolve_asset(&self, asset_path: &str) -> Result<String> {
        self.file_resolver.resolve_file(&self.path, asset_path)
    }
    pub fn get_ref_context(&self) -> &Self {
        if let Some(ref_context) = &self.current_ref_context {
            ref_context.as_ref()
        } else {
            self
        }
    }

    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        let mut clone: DocumentContext<FR> = self.clone();
        clone.current_component = Some(component);
        clone
    }

    pub fn is_target_node_render_node(&self) -> bool {
        if let Some(node) = self.target_node {
            if let Some(component) = self.current_component {
                if let Some(render) = component.get_render_expr() {
                    return render.node.as_ref().expect("Node must exist").get_id()
                        == node.get_id();
                }
            }
        }
        return false;
    }

    pub fn with_ref_context(&self, context: &DocumentContext<'expr, 'resolve_asset, FR>) -> Self {
        let mut clone = self.clone();
        clone.current_ref_context = Some(Box::new(context.clone()));
        clone
    }

    pub fn with_priority(&self, priority: u8) -> Self {
        let mut clone = self.clone();
        clone.priority = priority;
        clone
    }

    pub fn with_variant(&self, current_variant: &'expr ast::Variant) -> Self {
        let mut clone = self.clone();
        clone.current_variant = Some(current_variant);
        clone
    }

    pub fn within_path(&self, path: &str) -> Self {
        let mut clone = self.clone();
        clone.path = path.to_string();
        clone
    }

    pub fn with_target_node(&self, node: CurrentNode<'expr>) -> Self {
        let mut clone = self.clone();
        clone.target_node = Some(node);
        clone
    }

    pub fn shadow(&self, component_info: &ComponentRefInfo<'expr>) -> Self {
        let mut shadow = Self::new(&component_info.path, self.graph, self.file_resolver);
        shadow.shadow_of = Some(Box::new(self.clone()));
        shadow.current_component = Some(&component_info.expr);
        shadow.rules = self.rules.clone();
        shadow
    }

    pub fn top(&self) -> &Self {
        let mut curr = self;
        while let Some(shadow_of) = &curr.shadow_of {
            curr = shadow_of.as_ref();
        }
        curr
    }

    pub fn next_id(&self) -> String {
        self.id_generator.borrow_mut().new_id()
    }

    pub fn get_scoped_variant(&self, name: &str) -> Option<(&'expr ast::Variant, &Self)> {
        if let Some(variant) = &self.top().current_variant {
            if variant.name == name {
                return Some((variant, self.top()));
            }
        }

        self.get_ref_context()
            .current_component
            .and_then(|component| component.get_variant(name))
            .and_then(|variant| Some((variant, self.get_ref_context())))
    }
}
