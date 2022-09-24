pub use crate::base::ast::{Range, Str};
use crate::css::ast as css_ast;
pub use crate::docco::ast::Comment;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashSet;

macro_rules! body_contains {
    ($expr: expr, $pat: pat) => {
        $expr.iter().find(|child| matches!(child, $pat)) != None
    };
}

macro_rules! get_body_items {
    ($collection: expr, $enum: path, $type: ident) => {{
        let mut found: Vec<&$type> = vec![];

        for potential in $collection {
            if let $enum(item) = potential {
                found.push(item);
            }
        }

        found
    }};
}

#[derive(Debug, PartialEq, Clone)]
pub struct Component {
    pub id: String,
    pub is_public: bool,
    pub range: Range,
    pub name: String,
    pub body: Vec<ComponentBodyItem>,
}

impl Component {
    pub fn get_variant(&self, name: &str) -> Option<&Variant> {
        for item in &self.body {
            if let ComponentBodyItem::Variant(variant) = item {
                if variant.name == name {
                    return Some(variant);
                }
            }
        }

        None
    }
    pub fn get_render_expr(&self) -> Option<&Render> {
        for item in &self.body {
            if let ComponentBodyItem::Render(expr) = item {
                return Some(expr);
            }
        }

        None
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Variant {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub triggers: Vec<TriggerBodyItem>,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Script {
    pub id: String,
    pub range: Range,
    pub parameters: Vec<Parameter>,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Style {
    pub id: String,
    pub is_public: bool,
    pub name: Option<String>,
    pub variant_combo: Option<Vec<Reference>>,
    pub extends: Option<Vec<Reference>>,
    pub range: Range,
    pub declarations: Vec<css_ast::StyleDeclaration>,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Render {
    pub id: String,
    pub range: Range,
    pub node: RenderNode,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Element {
    pub namespace: Option<String>,
    pub tag_name: String,
    pub name: Option<String>,
    pub parameters: Vec<Parameter>,
    pub id: String,
    pub range: Range,
    pub body: Vec<ElementBodyItem>,
}


#[derive(Debug, PartialEq, Clone)]
pub struct Insert {
    pub name: String,
    pub id: String,
    pub range: Range,
    pub body: Vec<InsertBody>,
}

#[derive(Debug, PartialEq, Clone)]
pub enum InsertBody {
    Element(Element),
    Text(TextNode),
    Slot(Slot),
}

#[derive(Debug, PartialEq, Clone)]
pub struct Array {
    pub items: Vec<SimpleExpression>,
    pub id: String,
    pub range: Range,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Slot {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub body: Vec<SlotBodyItem>,
}

#[derive(Debug, PartialEq, Clone)]
pub enum SlotBodyItem {
    Element(Element),
    Text(TextNode),
}

#[derive(Debug, PartialEq, Clone)]
pub struct Parameter {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: SimpleExpression,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Number {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Boolean {
    pub id: String,
    pub range: Range,
    pub value: bool,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Reference {
    pub id: String,
    pub range: Range,
    pub path: Vec<String>,
}

#[derive(Debug, PartialEq, Clone)]
pub enum SimpleExpression {
    String(Str),
    Number(Number),
    Boolean(Boolean),
    Reference(Reference),
    Array(Array),
}

#[derive(Debug, PartialEq, Clone)]
pub enum ElementBodyItem {
    Slot(Slot),
    Insert(Insert),
    Style(Style),
    Element(Element),
    Text(TextNode),
    Override(Override),
}

#[derive(Debug, PartialEq, Clone)]
pub struct TextNode {
    pub id: String,
    pub name: Option<String>,
    pub value: String,
    pub range: Range,
    pub body: Vec<TextNodeBodyItem>,
}

impl TextNode {
    pub fn is_stylable(&self) -> bool {
        body_contains!(&self.body, TextNodeBodyItem::Style(_))
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Override {
    pub id: String,
    pub path: Vec<String>,
    pub range: Range,
    pub body: Vec<OverrideBodyItem>,
}

#[derive(Debug, PartialEq, Clone)]
pub enum OverrideBodyItem {
    Style(Style),
    Variant(Variant),
}

#[derive(Debug, PartialEq, Clone)]
pub enum TextNodeBodyItem {
    Style(Style),
}

#[derive(Debug, PartialEq, Clone)]
pub enum RenderNode {
    Slot(Slot),
    Element(Element),
    Text(TextNode),
}


#[derive(Debug, PartialEq, Clone)]
pub enum ComponentBodyItem {
    Render(Render),
    Variant(Variant),
    Script(Script),
}

#[derive(Debug, PartialEq, Clone)]
pub struct Import {
    pub id: String,
    pub range: Range,
    pub namespace: String,
    pub path: String,
}

#[derive(Debug, PartialEq, Clone)]
pub enum DocumentBodyItem {
    Import(Import),
    Style(Style),
    Component(Component),
    DocComment(Comment),
    Text(TextNode),
    Atom(Atom),
    Trigger(Trigger),
    Element(Element),
}

#[derive(Debug, PartialEq, Clone)]
pub struct DocumentCache {
    component_names: Option<HashSet<String>>,
}

impl DocumentCache {
    pub fn new() -> Self {
        Self {
            component_names: None,
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Document {
    pub id: String,
    pub range: Range,
    pub body: Vec<DocumentBodyItem>,
    pub(crate) cache: RefCell<DocumentCache>,
}

impl Document {
    pub fn get_imports(&self) -> Vec<&Import> {
        get_body_items!(&self.body, DocumentBodyItem::Import, Import)
    }
    pub fn get_atoms(&self) -> Vec<&Atom> {
        get_body_items!(&self.body, DocumentBodyItem::Atom, Atom)
    }
    pub fn get_components(&self) -> Vec<&Component> {
        get_body_items!(&self.body, DocumentBodyItem::Component, Component)
    }
    pub fn get_style(&self, name: &String) -> Option<&Style> {
        for item in &self.body {
            if let DocumentBodyItem::Style(style) = item {
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
        let mut cache = self.cache.borrow_mut();

        if cache.component_names == None {
            let component_names: HashSet<String> = self
                .get_components()
                .iter()
                .map(|component| component.name.to_string())
                .collect();

            cache.component_names = Some(component_names);
        }

        if let Some(component_names) = &cache.component_names {
            component_names.contains(name)
        } else {
            false
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Atom {
    pub id: String,
    pub is_public: bool,
    pub name: String,
    pub range: Range,
    pub value: css_ast::DeclarationValue,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Trigger {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub is_public: bool,
    pub body: Vec<TriggerBodyItem>,
}

#[derive(Debug, PartialEq, Clone)]
pub enum TriggerBodyItem {
    String(Str),
    Reference(Reference),
    Boolean(Boolean),
}
