use crate::base::ast::Range;
use serde::Serialize;
use std::error::Error;
use std::fmt;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum ErrorKind {
    UnexpectedToken,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ParserError {
    kind: ErrorKind,
    range: Range,
    message: String,
}

impl ParserError {
    pub fn new(message: String, range: Range, kind: ErrorKind) -> ParserError {
        ParserError {
            message,
            range,
            kind,
        }
    }
}

impl fmt::Display for ParserError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for ParserError {
    fn description(&self) -> &str {
        &self.message
    }
}
