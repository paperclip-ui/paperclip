use crate::base::ast::Range;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Component {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub body: Vec<ComponentBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Variant {
    pub id: String,
    pub range: Range,
    name: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Style {
    pub id: String,
    pub range: Range,
    body: Vec<StyleBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclaration {
    pub id: String,
    pub range: Range,
    name: String,
    value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum StyleBodyItem {
    Declaration(StyleDeclaration),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Render {
    pub id: String,
    pub range: Range,
    node: RenderNode,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    pub id: String,
    pub range: Range,
    body: Vec<ElementBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ElementBodyItem {
    Style(Style),
    Element(Box<Element>),
    Text(TextNode),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TextNode {
    pub id: String,
    pub range: Range,
    body: Vec<TextNodeBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum TextNodeBodyItem {
    Style(Style),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum RenderNode {
    Element(Element),
    Text(TextNode),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ComponentBodyItem {
    Render(Render),
    Variant(Variant),
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
    Component(Component),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Document {
    pub id: String,
    pub range: Range,
    pub body: Vec<DocumentBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum Expression {}
