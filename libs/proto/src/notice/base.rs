use crate::{notice, ast::base::Range};
use std::error::Error;
use std::fmt;

include!(concat!(env!("OUT_DIR"), "/notice.base.rs"));

impl Notice {
    pub fn new(level: notice::base::Level, code: notice::base::Code, message: String, path: String, content_range: Option<Range>) -> Self {
        Self {
            level: level.into(),
            code: code.into(),
            message,
            path,
            content_range
        }
    }
    pub fn error(code: notice::base::Code, message: String, path: String, content_range: Option<Range>) -> Self {
        Self::new(notice::base::Level::Error, code, message, path, content_range)
    }
    pub fn file_not_found(path: String, content_range: Option<Range>) -> Self {
        Self::new(notice::base::Level::Error, notice::base::Code::FileNotFound, "File not found".to_string(), path, content_range)
    }
    pub fn warning(code: notice::base::Code, message: String, path: String, content_range: Option<Range>) -> Self {
        Self::new(notice::base::Level::Warning, code, message, path, content_range)
    }
}

impl NoticeResult {
    pub fn contains_error(&self) -> bool {
        self.notices.iter().any(|notice| {
            notice.level == notice::base::Level::Error.into()
        })
    }
    pub fn to_result(&self) -> Result<NoticeResult, NoticeResult> {
        let clone = self.clone();
        if self.contains_error() {
            Err(clone)
        } else {
            Ok(clone)
        }
    }
    pub fn from(notice: Notice) -> Self {
        Self {
            notices: vec![notice]
        }
    }
}

impl fmt::Display for NoticeResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for notice in &self.notices {
            write!(f, "{}", notice.message)?;
        }
        Ok(())
    }
}

impl Error for NoticeResult {}