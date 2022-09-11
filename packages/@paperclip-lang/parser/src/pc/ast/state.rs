use super::get_assets;
pub use crate::base::ast::{Range, Str};
use crate::css::ast as css_ast;
pub use crate::docco::ast::Comment;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Variant {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub triggers: Vec<TriggerBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Script {
    pub id: String,
    pub range: Range,
    pub parameters: Vec<Parameter>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Style {
    pub id: String,
    pub is_public: bool,
    pub name: Option<String>,
    pub variant_combo: Option<Vec<Reference>>,
    pub extends: Option<Vec<Reference>>,
    pub range: Range,
    pub declarations: Vec<css_ast::StyleDeclaration>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Render {
    pub id: String,
    pub range: Range,
    pub node: RenderNode,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    pub namespace: Option<String>,
    pub tag_name: String,
    pub name: Option<String>,
    pub parameters: Vec<Parameter>,
    pub id: String,
    pub range: Range,
    pub body: Vec<ElementBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Insert {
    pub name: String,
    pub id: String,
    pub range: Range,
    pub body: Vec<InsertBody>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum InsertBody {
    Element(Element),
    Text(TextNode),
    Slot(Slot),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Array {
    pub items: Vec<SimpleExpression>,
    pub id: String,
    pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Slot {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub body: Vec<SlotBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum SlotBodyItem {
    Element(Element),
    Text(TextNode),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Parameter {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: SimpleExpression,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Number {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Boolean {
    pub id: String,
    pub range: Range,
    pub value: bool,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Reference {
    pub id: String,
    pub range: Range,
    pub path: Vec<String>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum SimpleExpression {
    String(Str),
    Number(Number),
    Boolean(Boolean),
    Reference(Reference),
    Array(Array),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ElementBodyItem {
    Slot(Slot),
    Insert(Insert),
    Style(Style),
    Element(Element),
    Text(TextNode),
    Override(Override),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TextNode {
    pub id: String,
    pub name: Option<String>,
    pub value: Option<String>,
    pub range: Range,
    pub body: Vec<TextNodeBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Override {
    pub id: String,
    pub path: Vec<String>,
    pub range: Range,
    pub body: Vec<OverrideBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum OverrideBodyItem {
    Style(Style),
    Variant(Variant),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum TextNodeBodyItem {
    Style(Style),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum RenderNode {
    Slot(Slot),
    Element(Element),
    Text(TextNode),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ComponentBodyItem {
    Render(Render),
    Variant(Variant),
    Script(Script),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Import {
    pub id: String,
    pub range: Range,
    pub namespace: String,
    pub path: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
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

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Document {
    pub id: String,
    pub range: Range,
    pub body: Vec<DocumentBodyItem>,
}

impl Document {
    pub fn get_imports(&self) -> Vec<&Import> {
        let mut imports = vec![];
        for item in &self.body {
            if let DocumentBodyItem::Import(import) = item {
                imports.push(import);
            }
        }
        imports
    }
    pub fn get_atoms(&self) -> Vec<&Atom> {
        let mut atoms: Vec<&Atom> = vec![];

        for item in &self.body {
            if let DocumentBodyItem::Atom(atom) = item {
                atoms.push(atom);
            }
        }

        atoms
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
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Atom {
    pub id: String,
    pub is_public: bool,
    pub name: String,
    pub range: Range,
    pub value: css_ast::DeclarationValue,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Trigger {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub is_public: bool,
    pub body: Vec<TriggerBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum TriggerBodyItem {
    String(Str),
    Reference(Reference),
    Boolean(Boolean),
}
