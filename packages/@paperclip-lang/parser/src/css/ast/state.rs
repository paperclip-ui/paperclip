use crate::base::ast::{Number, Range, Str};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclaration {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: DeclarationValue,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum DeclarationValue {
    Number(Number),
    Reference(Reference),
    String(Str),
    Measurement(Measurement),
    FunctionCall(FunctionCall),
    Arithmetic(Arithmetic),
    HexColor(HexColor),
    SpacedList(SpacedList),
    CommaList(CommaList),
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Reference {
    pub id: String,
    pub range: Range,
    pub path: Vec<String>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Arithmetic {
    pub id: String,
    pub range: Range,
    pub left: Box<DeclarationValue>,
    pub right: Box<DeclarationValue>,
    pub operator: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Measurement {
    pub id: String,
    pub range: Range,
    pub value: f32,
    pub unit: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct FunctionCall {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub arguments: Box<DeclarationValue>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct HexColor {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct SpacedList {
    pub id: String,
    pub range: Range,
    pub items: Box<Vec<DeclarationValue>>,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct CommaList {
    pub id: String,
    pub range: Range,
    pub items: Box<Vec<DeclarationValue>>,
}
