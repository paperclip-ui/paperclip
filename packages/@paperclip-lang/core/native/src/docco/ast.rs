use crate::base::ast::{Range, Str, Number};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Comment {
  body: Vec<CommentBodyItem>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum CommentBodyItem {
  Text(Text)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  value: String
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Property {
  name: String,
  value: PropertyValue
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum PropertyValue {
  String(Str),
  Parameters(Parameters)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Parameters {
  items: ParameterValue
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ParameterValue {
  String(Str),
  NUmber(Number)
}