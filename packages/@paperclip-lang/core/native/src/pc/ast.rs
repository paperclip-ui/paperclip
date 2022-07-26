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
    pub name: String,
    pub parameters: Vec<Parameter>,
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
    pub node: RenderNode,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    pub tag_name: String,
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
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Array {
    pub items: Vec<ArrayItem>,
    pub id: String,
    pub range: Range,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ArrayItem {
    String(Str),
    Number(Number),
    Boolean(Boolean),
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
    pub value: ParameterValue,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Str {
    pub id: String,
    pub range: Range,
    pub value: String,
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
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ParameterValue {
    String(Str),
    Number(Number),
    Boolean(Boolean),
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
    pub value: String,
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
