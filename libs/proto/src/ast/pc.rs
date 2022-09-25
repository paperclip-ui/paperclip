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
add_inner_wrapper!(insert_body::Inner, InsertBody);
add_inner_wrapper!(render_node::Inner, RenderNode);
add_inner_wrapper!(component_body_item::Inner, ComponentBodyItem);
add_inner_wrapper!(document_body_item::Inner, DocumentBodyItem);
add_inner_wrapper!(element_body_item::Inner, ElementBodyItem);
add_inner_wrapper!(text_node_body_item::Inner, TextNodeBodyItem);
add_inner_wrapper!(override_body_item::Inner, OverrideBodyItem);
add_inner_wrapper!(slot_body_item::Inner, SlotBodyItem);
add_inner_wrapper!(trigger_body_item::Inner, TriggerBodyItem);

impl RenderNode {
    pub fn get_id(&self) -> &String {
        self.get_inner().get_id()
    }
}

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
        self.name != None || body_contains!(&self.body, element_body_item::Inner::Style(_))
    }
    pub fn get_visible_children(&self) -> Vec<&ElementBodyItem> {
        self.body
            .iter()
            .filter(|child| {
                matches!(
                    child.get_inner(),
                    element_body_item::Inner::Text(_)
                        | element_body_item::Inner::Element(_)
                        | element_body_item::Inner::Slot(_)
                )
            })
            .collect()
    }
    pub fn get_inserts(&self) -> Vec<&Insert> {
        get_body_items!(&self.body, element_body_item::Inner::Insert, Insert)
    }
}

/**
 */

impl TextNode {
    pub fn is_stylable(&self) -> bool {
        body_contains!(&self.body, text_node_body_item::Inner::Style(_))
    }
}

/**
 */

impl render_node::Inner {
    pub fn get_id(&self) -> &String {
        match self {
            render_node::Inner::Element(expr) => &expr.id,
            render_node::Inner::Slot(expr) => &expr.id,
            render_node::Inner::Text(expr) => &expr.id,
        }
    }
}



impl Atom {
    pub fn get_var_name(&self) -> String {
      format!("--{}-{}", self.name, self.id)
    }
  }