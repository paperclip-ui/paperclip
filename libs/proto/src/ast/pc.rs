include!(concat!(env!("OUT_DIR"), "/ast.pc.rs"));

macro_rules! body_contains {
    ($expr: expr, $pat: pat) => {
        $expr.iter().find(|child| matches!(child.value, Some($pat))) != None
    };
}

macro_rules! get_body_items {
    ($collection: expr, $enum: path, $type: ident) => {{
        let mut found: Vec<&$type> = vec![];

        for potential in $collection {
            if let Some($enum(item)) = &potential.value {
                found.push(item);
            }
        }

        found
    }};
}
macro_rules! add_wrapper {
    ($path: path, $type: ident) => {
        impl $path {
            pub fn wrap(self) -> $type {
                $type { value: Some(self) }
            }
        }
    };
}

add_wrapper!(simple_expression::Value, SimpleExpression);
add_wrapper!(insert_body::Value, InsertBody);
add_wrapper!(render_node::Value, RenderNode);
add_wrapper!(component_body_item::Value, ComponentBodyItem);
add_wrapper!(document_body_item::Value, DocumentBodyItem);
add_wrapper!(element_body_item::Value, ElementBodyItem);
add_wrapper!(text_node_body_item::Value, TextNodeBodyItem);
add_wrapper!(override_body_item::Value, OverrideBodyItem);
add_wrapper!(slot_body_item::Value, SlotBodyItem);
add_wrapper!(trigger_body_item::Value, TriggerBodyItem);

impl RenderNode {
    pub fn get_id(&self) -> &String {
        self.value.as_ref().expect("Value node exist").get_id()
    }
}

/**
 */

impl Document {
    pub fn get_imports(&self) -> Vec<&Import> {
        get_body_items!(&self.body, document_body_item::Value::Import, Import)
    }
    pub fn get_atoms(&self) -> Vec<&Atom> {
        get_body_items!(&self.body, document_body_item::Value::Atom, Atom)
    }
    pub fn get_components(&self) -> Vec<&Component> {
        get_body_items!(&self.body, document_body_item::Value::Component, Component)
    }
    pub fn get_style(&self, name: &String) -> Option<&Style> {
        for item in &self.body {
            if let Some(document_body_item::Value::Style(style)) = &item.value {
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
            if let component_body_item::Value::Variant(variant) =
                &item.value.as_ref().expect("Value must be present")
            {
                if variant.name == name {
                    return Some(variant);
                }
            }
        }

        None
    }
    pub fn get_render_expr(&self) -> Option<&Render> {
        for item in &self.body {
            if let component_body_item::Value::Render(expr) =
                &item.value.as_ref().expect("Value must be present")
            {
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
        self.name != None || body_contains!(&self.body, element_body_item::Value::Style(_))
    }
    pub fn get_visible_children(&self) -> Vec<&ElementBodyItem> {
        self.body
            .iter()
            .filter(|child| {
                matches!(
                    child.value.as_ref().expect("Value must exist"),
                    element_body_item::Value::Text(_)
                        | element_body_item::Value::Element(_)
                        | element_body_item::Value::Slot(_)
                )
            })
            .collect()
    }
    pub fn get_inserts(&self) -> Vec<&Insert> {
        get_body_items!(&self.body, element_body_item::Value::Insert, Insert)
    }
}

/**
 */

impl TextNode {
    pub fn is_stylable(&self) -> bool {
        body_contains!(&self.body, text_node_body_item::Value::Style(_))
    }
}

/**
 */

impl render_node::Value {
    pub fn get_id(&self) -> &String {
        match self {
            render_node::Value::Element(expr) => &expr.id,
            render_node::Value::Slot(expr) => &expr.id,
            render_node::Value::Text(expr) => &expr.id,
        }
    }
}
