use crate::{ast::base::Range, notice};
use std::error::Error;
use std::fmt;

include!(concat!(env!("OUT_DIR"), "/notice.base.rs"));

impl Notice {
    pub fn new(
        level: notice::base::Level,
        code: notice::base::Code,
        message: String,
        path: String,
        content_range: Option<Range>,
    ) -> Self {
        Self {
            level: level.into(),
            code: code.into(),
            message,
            path,
            content_range,
        }
    }
    pub fn error(
        code: notice::base::Code,
        message: String,
        path: String,
        content_range: Option<Range>,
    ) -> Self {
        Self::new(
            notice::base::Level::Error,
            code,
            message,
            path,
            content_range,
        )
    }
    pub fn warning(
        code: notice::base::Code,
        message: String,
        path: String,
        content_range: Option<Range>,
    ) -> Self {
        Self::new(
            notice::base::Level::Warning,
            code,
            message,
            path,
            content_range,
        )
    }
    pub fn file_not_found(path: &str, content_range: &Option<Range>) -> Self {
        Self::new(
            notice::base::Level::Error,
            notice::base::Code::FileNotFound,
            "File not found".to_string(),
            path.to_string(),
            content_range.clone(),
        )
    }
    pub fn unexpected_token(path: String, content_range: Range) -> Self {
        Self::new(
            notice::base::Level::Error,
            notice::base::Code::UnexpectedToken,
            "Unexpected token".to_string(),
            path.to_string(),
            Some(content_range),
        )
    }
    pub fn end_of_file(path: String, content_range: Range) -> Self {
        Self::new(
            notice::base::Level::Error,
            notice::base::Code::EndOfFile,
            "Unexpected end of file".to_string(),
            path,
            Some(content_range),
        )
    }
    pub fn experimental_flag_not_enabled(
        feature: String,
        path: String,
        content_range: Option<Range>,
    ) -> Self {
        Self::new(
            notice::base::Level::Error,
            notice::base::Code::ExperimentalFlagNotEnabled,
            format!("Experimental feature \"{}\" not enabled", feature),
            path,
            content_range,
        )
    }
    pub fn reference_not_found(path: &str, content_range: &Option<Range>) -> Self {
        Self::new(
            notice::base::Level::Error,
            notice::base::Code::ReferenceNotFound,
            "Reference not found".to_string(),
            path.to_string(),
            content_range.clone(),
        )
    }
}

impl NoticeResult {
    pub fn new() -> Self {
        Self { notices: vec![] }
    }
    pub fn extend(&mut self, other: &NoticeResult) {
        self.notices.extend(other.notices.clone());
    }
    pub fn contains_error(&self) -> bool {
        self.notices
            .iter()
            .any(|notice| notice.level == notice::base::Level::Error.into())
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
            notices: vec![notice],
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
