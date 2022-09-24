use crate::base::ast::{Range, U16Position};
use serde::Serialize;
use std::error::Error;
use std::fmt;

#[derive(Debug, PartialEq, Clone)]
pub enum ErrorKind {
    UnexpectedToken,
    EOF,
}

#[derive(Debug, PartialEq, Clone)]
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
    pub fn new_eof() -> ParserError {
        ParserError {
            message: "End of file".to_string(),
            range: Range::new(U16Position::new(0, 0, 0), U16Position::new(0, 0, 0)),
            kind: ErrorKind::EOF,
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
