use serde::Serialize;
use std::collections::HashMap;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Bounds {
    pub left: f32,
    pub right: f32,
    pub width: f32,
    pub height: f32,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NodeMetadata {
    pub bounds: Option<Bounds>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    pub tag_name: String,
    pub source_id: Option<String>,
    pub attributes: Vec<Attribute>,
    pub metadata: Option<NodeMetadata>,
    pub children: Vec<NodeChild>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Attribute {
    pub source_id: Option<String>,
    pub name: String,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TextNode {
    pub source_id: Option<String>,
    pub value: String,
    pub metadata: Option<NodeMetadata>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Document {
    pub source_id: Option<String>,
    pub children: Vec<NodeChild>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum NodeChild {
    Element(Element),
    TextNode(TextNode),
}
