use crate::base::ast::{Number, Range, Str};
use crate::docco::ast as docco_ast;
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
    Keyword(Reference),
    Number(Number),
    Reference(Reference),
    Measurement(Measurement),
    FunctionCall(FunctionCall),
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
    pub arguments: Box<DeclarationValue>
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
