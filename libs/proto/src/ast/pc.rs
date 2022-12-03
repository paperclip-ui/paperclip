use crate::add_inner_wrapper;
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
    }pub fn get_variants(&self) -> Vec<&Variant> {
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

impl TryFrom<DocumentBodyItem> for Style {
    type Error = ();
    fn try_from(value: DocumentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner() {
            document_body_item::Inner::Style(style) => Ok(style.clone()),
            _ => Err(()),
        }
    }
}
