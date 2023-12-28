use std::error::Error;
use std::fmt;

use paperclip_proto::ast::base::Range;
use paperclip_proto::notice::base::{Code, Notice, NoticeList};

#[derive(Debug, PartialEq, Clone)]
pub enum RuntimeErrorCode {
    FileNotFound,
    ReferenceNotFound,
}

#[derive(Debug, PartialEq, Clone)]
pub struct RuntimeError {
    pub code: RuntimeErrorCode,
    pub message: String,
    pub range: Option<Range>,
}

impl RuntimeError {
    pub fn new(code: RuntimeErrorCode, message: String, range: Option<Range>) -> Self {
        Self {
            code,
            message,
            range,
        }
    }
    pub fn into_notice(&self, path: &str) -> NoticeList {
        NoticeList::from(Notice::error(
            match self.code {
                RuntimeErrorCode::FileNotFound => Code::FileNotFound,
                RuntimeErrorCode::ReferenceNotFound => Code::ReferenceNotFound,
            },
            self.message.clone(),
            Some(path.to_string()),
            self.range.clone(),
        ))
    }
}

impl fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for RuntimeError {
    fn description(&self) -> &str {
        &self.message
    }
}
