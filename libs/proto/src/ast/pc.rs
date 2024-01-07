use std::cell::RefCell;

use anyhow::Result;

use crate::add_inner_wrapper;
use std::collections::HashMap;
use std::rc::Rc;

use super::{
    docco::Comment,
    expr_map::ExprMap,
    visit::{Visitable, Visitor, VisitorResult},
    wrapper::ExpressionWrapper,
};
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
add_inner_wrapper!(override_body_item::Inner, OverrideBodyItem);
add_inner_wrapper!(trigger_body_item::Inner, TriggerBodyItem);
add_inner_wrapper!(switch_item::Inner, SwitchItem);
/**
 */

impl Document {
    pub fn get_imports(&self) -> Vec<&Import> {
        get_body_items!(&self.body, node::Inner::Import, Import)
    }
    pub fn get_atoms(&self) -> Vec<&Atom> {
        get_body_items!(&self.body, node::Inner::Atom, Atom)
    }
    pub fn get_styles(&self) -> Vec<&Style> {
        get_body_items!(&self.body, node::Inner::Style, Style)
    }
    pub fn get_triggers(&self) -> Vec<&Trigger> {
        get_body_items!(&self.body, node::Inner::Trigger, Trigger)
    }
    pub fn get_declarations(&self) -> HashMap<String, ExpressionWrapper> {
        let mut exports = HashMap::new();
        for child in &self.body {
            match child.get_inner() {
                node::Inner::Atom(expr) => {
                    exports.insert(expr.name.to_string(), expr.into());
                }
                node::Inner::Component(expr) => {
                    exports.insert(expr.name.to_string(), expr.into());
                }
                node::Inner::Trigger(expr) => {
                    exports.insert(expr.name.to_string(), expr.into());
                }
                node::Inner::Style(expr) => {
                    if let Some(name) = &expr.name {
                        exports.insert(name.to_string(), expr.into());
                    }
                }
                _ => {}
            }
        }
        exports
    }
    pub fn get_import_by_ns(&self, ns: &str) -> Option<&Import> {
        self.get_imports()
            .into_iter()
            .find(|imp| &imp.namespace == ns)
    }
    pub fn get_import_by_src(&self, src: &str) -> Option<&Import> {
        self.get_imports().into_iter().find(|imp| &imp.path == src)
    }
    pub fn get_export(&self, name: &str) -> Option<ExpressionWrapper> {
        for child in &self.body {
            match child.get_inner() {
                node::Inner::Component(component) => {
                    if component.name == name {
                        return Some(component.into());
                    }
                }
                node::Inner::Style(style) => {
                    if let Some(style_name) = &style.name {
                        if style_name == name {
                            return Some(style.into());
                        }
                    }
                }
                node::Inner::Atom(atom) => {
                    if atom.name == name {
                        return Some(atom.into());
                    }
                }
                node::Inner::Trigger(trigger) => {
                    if trigger.name == name {
                        return Some(trigger.into());
                    }
                }
                _ => {}
            }
        }
        None
    }
    pub fn get_component_by_name(&self, name: &str) -> Option<&Component> {
        self.get_components()
            .into_iter()
            .find(|expr| &expr.name == name)
    }
    pub fn get_elements(&self, _tag_name: &str, _namespace: Option<String>) -> Vec<&Element> {
        vec![]
    }
    pub fn get_components(&self) -> Vec<&Component> {
        get_body_items!(&self.body, node::Inner::Component, Component)
    }
    pub fn get_style(&self, name: &String) -> Option<&Style> {
        for item in &self.body {
            if let Some(node::Inner::Style(style)) = &item.inner {
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

struct GetSlots {
    slots: Rc<RefCell<Vec<Slot>>>,
}

impl Visitor<()> for GetSlots {
    fn visit_slot(&self, slot: &Slot) -> VisitorResult<(), Self> {
        self.slots.borrow_mut().push(slot.clone());
        VisitorResult::Continue
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
    pub fn get_slot(&self, name: &str) -> Option<Slot> {
        return self.get_slots().into_iter().find(|slot| slot.name == name);
    }
    pub fn get_slots(&self) -> Vec<Slot> {
        let slots = Rc::new(RefCell::new(vec![]));

        self.accept(&GetSlots {
            slots: slots.clone(),
        });

        let slots = slots.borrow();
        return slots.clone();
    }
}

impl Insert {
    pub fn get_slot(&self, map: &ExprMap) -> Option<Slot> {
        let instance = map.get_parent(&self.id)?;

        let instance_component = map.get_instance_component(instance.get_id())?;

        instance_component.get_slot(&self.name)
    }
}

impl Slot {
    pub fn get_component<'expr>(&self, map: &'expr ExprMap) -> Option<&'expr Component> {
        map.get_owner_component(&self.id)
    }
}

impl Variant {
    pub fn get_component<'expr>(&self, map: &'expr ExprMap) -> Option<&'expr Component> {
        map.get_owner_component(&self.id)
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
    pub fn get_name(&self) -> Option<String> {
        for param in &self.parameters {
            if param.name == "name" {
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
                    node::Inner::Text(_)
                        | node::Inner::Element(_)
                        | node::Inner::Slot(_)
                        | node::Inner::Repeat(_)
                        | node::Inner::Switch(_)
                        | node::Inner::Condition(_)
                )
            })
            .collect()
    }
    pub fn get_inserts(&self) -> Vec<&Insert> {
        get_body_items!(&self.body, node::Inner::Insert, Insert)
    }
    pub fn get_source_document<'a>(&'a self, map: &'a ExprMap) -> Option<&'a Document> {
        map.get_owner_document(&self.id)
    }
    pub fn get_instance_component<'a>(&'a self, map: &'a ExprMap) -> Option<&'a Component> {
        map.get_instance_component(&self.id)
    }
}

impl Node {
    pub fn get_name(&self) -> Option<String> {
        match self.get_inner() {
            node::Inner::Element(element) => element.name.clone(),
            node::Inner::Text(text) => text.name.clone(),
            node::Inner::Insert(insert) => Some(insert.name.clone()),
            node::Inner::Slot(slot) => Some(slot.name.clone()),
            node::Inner::Component(slot) => Some(slot.name.clone()),
            node::Inner::Atom(slot) => Some(slot.name.clone()),
            node::Inner::Style(style) => style.name.clone(),
            node::Inner::Trigger(slot) => Some(slot.name.clone()),
            node::Inner::Override(_)
            | node::Inner::Repeat(_)
            | node::Inner::Import(_)
            | node::Inner::DocComment(_)
            | node::Inner::Script(_)
            | node::Inner::Switch(_)
            | node::Inner::Condition(_) => None,
        }
    }
    pub fn set_name(&mut self, value: &str) {
        match self.get_inner_mut() {
            node::Inner::Atom(expr) => expr.name = value.to_string(),
            node::Inner::Component(expr) => expr.name = value.to_string(),
            node::Inner::Trigger(expr) => expr.name = value.to_string(),
            node::Inner::Element(expr) => expr.name = Some(value.to_string()),
            node::Inner::Text(expr) => expr.name = Some(value.to_string()),
            node::Inner::Style(expr) => expr.name = Some(value.to_string()),
            _ => {}
        }
    }
    pub fn strip_doc_comment(&self) -> Node {
        match self.get_inner() {
            node::Inner::Element(element) => {
                let mut element = element.clone();
                element.comment = None;
                (&element).into()
            }
            node::Inner::Text(text) => {
                let mut text = text.clone();
                text.comment = None;
                (&text).into()
            }
            _ => self.clone(),
        }
    }
    pub fn get_comment(&self) -> Option<&Comment> {
        match self.get_inner() {
            node::Inner::Component(expr) => expr.comment.as_ref(),
            node::Inner::Element(expr) => expr.comment.as_ref(),
            node::Inner::Text(expr) => expr.comment.as_ref(),
            _ => None,
        }
    }

    pub fn get_doc_comment(&self) -> Option<Comment> {
        match self.get_inner() {
            node::Inner::Element(element) => element.comment.clone(),
            node::Inner::Text(text) => text.comment.clone(),
            _ => None,
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

impl<'a> TryFrom<&'a mut ComponentBodyItem> for &'a mut Render {
    type Error = ();
    fn try_from(value: &'a mut ComponentBodyItem) -> Result<Self, Self::Error> {
        match value.get_inner_mut() {
            component_body_item::Inner::Render(expr) => Ok(expr),
            _ => Err(()),
        }
    }
}

macro_rules! into_from_node {
    ($([$expr: path, $outer: ident]), *) => {
        $(
            impl<'a> From<&$expr> for Node {
                fn from(value: &$expr) -> Self {
                    node::Inner::$outer(value.clone()).get_outer()
                }
            }

            impl<'a> TryFrom<&'a mut Node> for &'a mut $expr {
                type Error = ();
                fn try_from(value: &'a mut Node) -> Result<Self, Self::Error> {
                    match value.get_inner_mut() {
                        node::Inner::$outer(expr) => Ok(expr),
                        _ => Err(()),
                    }
                }
            }

            impl TryFrom<Node> for $expr {
                type Error = ();
                fn try_from(value: Node) -> Result<Self, Self::Error> {
                    match value.get_inner() {
                        node::Inner::$outer(style) => Ok(style.clone()),
                        _ => Err(()),
                    }
                }
            }

            impl TryFrom<&Node> for $expr {
                  type Error = ();
                  fn try_from(value: &Node) -> Result<Self, Self::Error> {
                      match value.get_inner() {
                          node::Inner::$outer(style) => Ok(style.clone()),
                          _ => Err(()),
                      }
                  }
              }
        )*
    };
}

into_from_node! {
    [Element, Element],
    [TextNode, Text],
    [Insert, Insert],
    [Slot, Slot],
    [Style, Style],
    [Component, Component],
    [Import, Import],
    [Atom, Atom],
    [Trigger, Trigger],
    [Script, Script]
}
