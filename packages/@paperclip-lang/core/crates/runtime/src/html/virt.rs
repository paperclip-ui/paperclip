use std::collections::HashMap;
use serde::Serialize;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Bounds {
    left: f32,
    right: f32,
    width: f32,
    height: f32
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct NodeMetadata {
    bounds: Option<Bounds>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Element {
    source_id: String,
    attributes: Vec<Attribute>,
    metadata: Option<NodeMetadata>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Attribute {
    source_id: String,
    name: String,
    value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct TextNode {
    source_id: String,
    value: String,
    metadata: Option<NodeMetadata>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Document {
    children: Vec<DocumentChild>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
#[serde(tag = "kind")]
pub enum DocumentChild {
    Element(Element),
    TextNode(TextNode),
}
