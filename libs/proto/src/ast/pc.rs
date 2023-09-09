use crate::{add_inner_wrapper, virt::core::value};
include!(concat!(env!("OUT_DIR"), "/ast.pc.rs"));

macro_rules! body_contains {
    ($expr: expr, $pat: pat) => {
        $expr.iter().find(|child| matches!(child.inner, Some($pat))) != None
    };
}

macro_rules! get_body_items {
    ($collection: expr, $enum: path, $type: ident) => {{
        let mut found: Vec<&$type> = vec![];

        for potential in $collection {
            if let Some($enum(item)) = &potential.inner {
                found.push(item);
            }
        }

        found
    }};
}

add_inner_wrapper!(simple_expression::Inner, SimpleExpression);
add_inner_wrapper!(node::Inner, Node);
add_inner_wrapper!(component_body_item::Inner, ComponentBodyItem);
add_inner_wrapper!(document_body_item::Inner, DocumentBodyItem);
add_inner_wrapper!(override_body_item::Inner, OverrideBodyItem);
add_inner_wrapper!(trigger_body_item::Inner, TriggerBodyItem);
/**
 */

impl Document {
    pub fn get_imports(&self) -> Vec<&Import> {
        get_body_items!(&self.body, document_body_item::Inner::Import, Import)
    }
    pub fn get_atoms(&self) -> Vec<&Atom> {
        get_body_items!(&self.body, document_body_item::Inner::Atom, Atom)
    }
    pub fn get_styles(&self) -> Vec<&Style> {
        get_body_items!(&self.body, document_body_item::Inner::Style, Style)
    }
    pub fn get_import_by_ns(&self, ns: &str) -> Option<&Import> {
        self.get_imports()
            .into_iter()
            .find(|imp| &imp.namespace == ns)
    }
    pub fn get_component_by_name(&self, name: &str) -> Option<&Component> {
        self.get_components()
            .into_iter()
            .find(|expr| &expr.name == name)
    }
    pub fn get_components(&self) -> Vec<&Component> {
        get_body_items!(&self.body, document_body_item::Inner::Component, Component)
    }
    pub fn get_style(&self, name: &String) -> Option<&Style> {
        for item in &self.body {
            if let Some(document_body_item::Inner::Style(style)) = &item.inner {
                if let Some(style_name) = &style.name {
                    if style_name == name {
                        return Some(style);
                    }
                }
            }
        }
        None
    }
    pub fn contains_component_name(&self, name: &str) -> bool {
        self.get_components()
            .iter()
            .any(|component| name == component.name)
    }
}

/**
 */

impl Component {
    pub fn get_variant(&self, name: &str) -> Option<&Variant> {
        for item in &self.body {
            if let component_body_item::Inner::Variant(variant) = &item.get_inner() {
                if variant.name == name {
                    return Some(variant);
                }
            }
        }

        None
    }
    pub fn get_script(&self, target: &str) -> Option<&Script> {
        for item in &self.body {
            if let component_body_item::Inner::Script(script) = &item.get_inner() {
                if script.get_target() == Some(target.to_string()) && script.get_src().is_some() {
                    return Some(script);
                }
            }
        }

        None
    }
    pub fn get_variants(&self) -> Vec<&Variant> {
        get_body_items!(&self.body, component_body_item::Inner::Variant, Variant)
    }
    pub fn get_render_expr(&self) -> Option<&Render> {
        for item in &self.body {
            if let component_body_item::Inner::Render(expr) = &item.get_inner() {
                return Some(expr);
            }
        }

        None
    }
}

impl Script {
    pub fn get_target(&self) -> Option<String> {
        for param in &self.parameters {
            if param.name == "target" {
                match &param.value.as_ref().unwrap().inner.clone().unwrap() {
                    simple_expression::Inner::Str(value) => return Some(value.value.clone()),
                    _ => {}
                }
            }
        }

        None
    }
    pub fn get_src(&self) -> Option<String> {
        for param in &self.parameters {
            if param.name == "src" {
                match &param.value.as_ref().unwrap().inner.clone().unwrap() {
                    simple_expression::Inner::Str(value) => return Some(value.value.clone()),
                    _ => {}
                }
            }
        }

        None
    }
}

/**
 */

impl Element {
    pub fn is_stylable(&self) -> bool {
        self.name != None || body_contains!(&self.body, node::Inner::Style(_))
    }
    pub fn get_visible_children(&self) -> Vec<&Node> {
        self.body
            .iter()
            .filter(|child| {
                matches!(
                    child.get_inner(),
                    node::Inner::Text(_) | node::Inner::Element(_) | node::Inner::Slot(_)
                )
            })
            .collect()
    }
    pub fn get_inserts(&self) -> Vec<&Insert> {
        get_body_items!(&self.body, node::Inner::Insert, Insert)
    }
}

impl Node {
    pub fn get_name(&self) -> Option<String> {
        match self.get_inner() {
            node::Inner::Element(element) => element.name.clone(),
            node::Inner::Text(text) => text.name.clone(),
            node::Inner::Insert(insert) => Some(insert.name.clone()),
            node::Inner::Slot(slot) => Some(slot.name.clone()),
            node::Inner::Style(_) | node::Inner::Override(_) => None,
        }
    }
}

/**
 */

impl TextNode {
    pub fn is_stylable(&self) -> bool {
        body_contains!(&self.body, node::Inner::Style(_))
    }
}

impl Atom {
    pub fn get_var_name(&self) -> String {
        format!("--{}-{}", self.name, self.id)
    }
}

impl DocumentBodyItem {
    pub fn set_name(&mut self, value: &str) {
        match self.get_inner_mut() {
            document_body_item::Inner::Atom(expr) => expr.name = value.to_string(),
            document_body_item::Inner::Component(expr) => expr.name = value.to_string(),
            document_body_item::Inner::Trigger(expr) => expr.name = value.to_string(),
            document_body_item::Inner::Element(expr) => expr.name = Some(value.to_string()),
            document_body_item::Inner::Text(expr) => expr.name = Some(value.to_string()),
            document_body_item::Inner::Style(expr) => expr.name = Some(value.to_string()),
            document_body_item::Inner::Import(_) | document_body_item::Inner::DocComment(_) => {}
        }
    }
    pub fn get_name(&self) -> Option<String> {
        match self.get_inner() {
            document_body_item::Inner::Atom(expr) => Some(expr.name.clone()),
            document_body_item::Inner::Component(expr) => Some(expr.name.clone()),
            document_body_item::Inner::Trigger(expr) => Some(expr.name.clone()),
            document_body_item::Inner::Element(expr) => expr.name.clone(),
            document_body_item::Inner::Text(expr) => expr.name.clone(),
            document_body_item::Inner::Style(expr) => expr.name.clone(),
            document_body_item::Inner::Import(_) | document_body_item::Inner::DocComment(_) => None,
        }
    }
}

impl TryFrom<Node> for DocumentBodyItem {
    type Error = ();
    fn try_from(value: Node) -> Result<Self, Self::Error> {
        match value.get_inner() {
            node::Inner::Element(element) => {
                Ok(document_body_item::Inner::Element(element.clone()).get_outer())
            }
            node::Inner::Text(text) => {
                Ok(document_body_item::Inner::Text(text.clone()).get_outer())
            }
            _ => Err(()),
        }
    }
}

impl TryFrom<DocumentBodyItem> for Node {
    type Error = ();
    fn try_from(value: DocumentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner() {
            document_body_item::Inner::Element(element) => {
                Ok(node::Inner::Element(element.clone()).get_outer())
            }
            document_body_item::Inner::Text(text) => {
                Ok(node::Inner::Text(text.clone()).get_outer())
            }
            _ => Err(()),
        }
    }
}

impl TryFrom<DocumentBodyItem> for Atom {
    type Error = ();
    fn try_from(value: DocumentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner() {
            document_body_item::Inner::Atom(element) => Ok(element.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<DocumentBodyItem> for Style {
    type Error = ();
    fn try_from(value: DocumentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner() {
            document_body_item::Inner::Style(style) => Ok(style.clone()),
            _ => Err(()),
        }
    }
}

impl<'a> TryFrom<&'a mut ComponentBodyItem> for &'a mut Render {
    type Error = ();
    fn try_from(value: &'a mut ComponentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner_mut() {
            component_body_item::Inner::Render(expr) => Ok(expr),
            _ => Err(()),
        }
    }
}

impl TryFrom<Node> for Style {
    type Error = ();
    fn try_from(value: Node) -> Result<Self, Self::Error> {
        match value.get_inner() {
            node::Inner::Style(style) => Ok(style.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<Node> for Element {
    type Error = ();
    fn try_from(value: Node) -> Result<Self, Self::Error> {
        match value.get_inner() {
            node::Inner::Element(style) => Ok(style.clone()),
            _ => Err(()),
        }
    }
}
impl<'a> TryFrom<&'a mut Node> for &'a mut Element {
    type Error = ();
    fn try_from(value: &'a mut Node) -> Result<Self, Self::Error> {
        match value.get_inner_mut() {
            node::Inner::Element(expr) => Ok(expr),
            _ => Err(()),
        }
    }
}

impl<'a> TryFrom<&'a mut Node> for &'a mut Insert {
    type Error = ();
    fn try_from(value: &'a mut Node) -> Result<Self, Self::Error> {
        match value.get_inner_mut() {
            node::Inner::Insert(expr) => Ok(expr),
            _ => Err(()),
        }
    }
}

impl<'a> TryFrom<&'a mut Node> for &'a mut Style {
    type Error = ();
    fn try_from(value: &'a mut Node) -> Result<Self, Self::Error> {
        match value.get_inner_mut() {
            node::Inner::Style(style) => Ok(style),
            _ => Err(()),
        }
    }
}
