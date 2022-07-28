use crate::base::ast::{Range, Str, Number};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Comment {
  pub body: Vec<CommentBodyItem>
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum CommentBodyItem {
  Text(Text),
  Property(Property)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Text {
  pub value: String
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Property {
  pub name: String,
  pub value: PropertyValue
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum PropertyValue {
  String(Str),
  Parameters(Parameters)
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Parameters {
  pub items: ParameterValue
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ParameterValue {
  String(Str),
  NUmber(Number)
}