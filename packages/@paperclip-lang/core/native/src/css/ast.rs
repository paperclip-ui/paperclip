use crate::base::ast::{Range, Str};
use crate::docco::ast as docco_ast;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct StyleDeclaration {
    pub id: String,
    pub range: Range,
    pub name: String,
    pub value: String,
}
