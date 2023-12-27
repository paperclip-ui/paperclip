use paperclip_proto::notice::base as notice;

use crate::base::ast::{Range, U16Position};
use std::error::Error;
use std::fmt;

#[derive(Debug, PartialEq, Clone)]
pub enum ErrorKind {
    UnexpectedToken,
    EOF,
    Experimental,
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
    pub fn new_feature_not_enabled(feature: &str, range: &Range) -> ParserError {
        ParserError {
            message: format!("Experimental feature \"{}\" not enabled", feature).to_string(),
            range: range.clone(),
            kind: ErrorKind::Experimental,
        }
    }
    pub fn into_notice_result(&self, path: &str) -> notice::NoticeResult {
        notice::NoticeResult::from(notice::Notice::error(match self.kind {
            ErrorKind::EOF => {
                notice::Code::EndOfFile
            },
            ErrorKind::Experimental => {
                notice::Code::ExperimentalFlagNotEnabled
            },
            ErrorKind::UnexpectedToken => {
                notice::Code::UnexpectedToken
            }
        }, self.message.clone(), path.to_string(), Some(self.range.clone())))
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
