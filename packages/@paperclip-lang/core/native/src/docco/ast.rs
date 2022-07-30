use crate::base::ast::{Number, Range, Str};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Comment {
    pub id: String,
    pub range: Range,
    pub body: Vec<CommentBodyItem>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum CommentBodyItem {
    Text(Text),
    Property(Property),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Property {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: PropertyValue,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum PropertyValue {
    String(Str),
    Parameters(Parameters),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Parameters {
    pub id: String,
    pub range: Range,
    pub items: ParameterValue,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ParameterValue {
    String(Str),
    NUmber(Number),
}
