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
    pub body: Vec<StyleBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclaration {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum StyleBodyItem {
    Declaration(StyleDeclaration),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Render {
    pub id: String,
    pub range: Range,
    pub node: Node,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    pub tag_name: String,
    pub id: String,
    pub range: Range,
    pub body: Vec<ElementBodyItem>,
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
    pub value: String,
    pub range: Range,
    pub body: Vec<TextNodeBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum TextNodeBodyItem {
    Style(Style),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum Node {
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
    Style(Style),
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
