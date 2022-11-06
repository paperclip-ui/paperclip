use crate::add_inner_wrapper;
use std::borrow::BorrowMut;

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

macro_rules! expressions {
    ($(($name:ident, $expr:ty, $this:ident => $id_ret:expr)),*) => {
        pub enum MutableExpressionRef<'a> {
            $(
                $name(&'a $expr),
            )*
        }

        trait Outer {
            fn outer_mut<'a>(&'a mut self) -> MutableExpressionRef<'a>;
            fn get_id<'a>(&'a self) -> &'a str;
        }

        $(
            impl Outer for $expr {
                fn outer_mut<'a>(&'a mut self) -> MutableExpressionRef<'a> {
                    MutableExpressionRef::$name(self.borrow_mut())
                }
                fn get_id<'a>(&'a $this) -> &'a str {
                    $id_ret
                }
            }
        )*
    };
}

macro_rules! match_each_expr_id {
    ($this:ident, $($name:path),*) => {
        match $this {
            $(
                $name(expr) => &expr.id,
            )*
        }
    };
}


trait Visitor<'a> {
    fn visit_mut(&'a mut self, expr: &'a MutableExpressionRef<'a>);
    fn should_continue(&self) -> bool;
}

add_inner_wrapper!(simple_expression::Inner, SimpleExpression);
add_inner_wrapper!(node::Inner, Node);
add_inner_wrapper!(component_body_item::Inner, ComponentBodyItem);
add_inner_wrapper!(document_body_item::Inner, DocumentBodyItem);
add_inner_wrapper!(override_body_item::Inner, OverrideBodyItem);
add_inner_wrapper!(trigger_body_item::Inner, TriggerBodyItem);

expressions! {
    (Document, Document, self => &self.id),
    (DocumentBodyItem, DocumentBodyItem, self => &self.get_inner().get_id()),
    (DocumentBodyItemInner, document_body_item::Inner, self => match_each_expr_id!(self,
        document_body_item::Inner::Import,
        document_body_item::Inner::Style,
        document_body_item::Inner::Component,
        document_body_item::Inner::DocComment,
        document_body_item::Inner::Text,
        document_body_item::Inner::Atom,
        document_body_item::Inner::Trigger,
        document_body_item::Inner::Element
    )),
    (Import, Import, self => &self.id),
    (Style, Style, self => &self.id),
    (Component, Component, self => &self.id),
    (ComponentBodyItem, ComponentBodyItem, self => self.get_inner().get_id()),
    (ComponentBodyItemInner, component_body_item::Inner, self => match_each_expr_id!(self, 
        component_body_item::Inner::Render,
        component_body_item::Inner::Variant,
        component_body_item::Inner::Script
    )),
    (Script, Script, self => &self.id),
    (Variant, Variant, self => &self.id),
    (Render, Render, self => &self.id),
    (Atom, Atom, self => &self.id),
    (Trigger, Trigger, self => &self.id),
    (TriggerBodyItem, TriggerBodyItem, self => self.get_inner().get_id()),
    (TriggerBodyItemInner, trigger_body_item::Inner, self => match_each_expr_id!(self, 
        trigger_body_item::Inner::Str,
        trigger_body_item::Inner::Reference,
        trigger_body_item::Inner::Boolean
    )),
    (TextNode, TextNode, self => &self.id),
    (Parameter, Parameter, self => &self.id),
    (SimpleExpression, SimpleExpression, self => &self.get_inner().get_id()),
    (SimpleExpressionInner, simple_expression::Inner, self => match_each_expr_id!(self,
        simple_expression::Inner::Str,
        simple_expression::Inner::Number,
        simple_expression::Inner::Boolean,
        simple_expression::Inner::Reference,
        simple_expression::Inner::Array
    )),
    (Reference, Reference, self => &self.id),
    (Array, Array, self => &self.id),
    (Element, Element, self => &self.id),
    (Node, Node, self => &self.get_inner().get_id()),
    (NodeInner, node::Inner, self => match_each_expr_id!(self, 
        node::Inner::Slot,
        node::Inner::Insert,
        node::Inner::Style,
        node::Inner::Element,
        node::Inner::Text,
        node::Inner::Override
    )),
    (Slot, Slot, self => &self.id),
    (Insert, Insert, self => &self.id),
    (Override, Override, self => &self.id),
    (OverrideBodyItem, OverrideBodyItem, self => self.get_inner().get_id()),
    (OverrideBodyItemInner, override_body_item::Inner, self => match_each_expr_id!(self, 
        override_body_item::Inner::Style,
        override_body_item::Inner::Variant
    ))

}

/**
 */

impl Document {
    pub fn get_expr_by_id_mut<'a>(&'a mut self) -> Option<MutableExpressionRef<'a>> {
        None
    }
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

struct ExprFinder<'a> {
    expr: Option<MutableExpressionRef<'a>>,
}

impl<'a> Visitor<'a> for ExprFinder<'a> {
    fn visit_mut(&'a mut self, expr: &'a MutableExpressionRef<'a>) {}
    fn should_continue(&self) -> bool {
        !matches!(self.expr, None)
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
