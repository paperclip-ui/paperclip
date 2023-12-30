use crate::{ast::base::Range, notice};
use std::error::Error;
use std::fmt;
use std::hash::{Hash, Hasher};
include!(concat!(env!("OUT_DIR"), "/notice.base.rs"));

impl Eq for Notice {}
impl Hash for Notice {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.level.hash(state);
        self.code.hash(state);
        self.message.hash(state);
        self.path.hash(state);
        self.content_range.hash(state);
    }
}

impl Notice {
    pub fn new(
        level: notice::base::Level,
        code: notice::base::Code,
        message: String,
        path: Option<String>,
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
    pub fn to_list(&self) -> NoticeList {
        NoticeList::from(self.clone())
    }
    pub fn error(
        code: notice::base::Code,
        message: String,
        path: Option<String>,
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
        path: Option<String>,
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
        Self::error(
            notice::base::Code::FileNotFound,
            "File not found".to_string(),
            Some(path.to_string()),
            content_range.clone(),
        )
    }
    pub fn unexpected_token(path: &str, content_range: &Range) -> Self {
        Self::error(
            notice::base::Code::UnexpectedToken,
            "Unexpected token".to_string(),
            Some(path.to_string()),
            Some(content_range.clone()),
        )
    }
    pub fn unable_to_parse(path: &str) -> Self {
        Self::error(
            notice::base::Code::UnableToParse,
            "Unable to parse file".to_string(),
            Some(path.to_string()),
            None,
        )
    }
    pub fn unexpected(message: &str, path: Option<String>) -> Self {
        Self::error(
            notice::base::Code::UnableToParse,
            message.to_string(),
            path,
            None,
        )
    }
    pub fn end_of_file(path: &str, content_range: &Range) -> Self {
        Self::error(
            notice::base::Code::EndOfFile,
            "Unexpected end of file".to_string(),
            Some(path.to_string()),
            Some(content_range.clone()),
        )
    }
    pub fn lint_magic_value(level: Level, path: &str, content_range: &Option<Range>) -> Self {
        Self::new(
            level,
            notice::base::Code::LintMagicValue,
            "This value should be elevated to a variable.".to_string(),
            Some(path.to_string()),
            content_range.clone(),
        )
    }
    pub fn experimental_flag_not_enabled(
        feature: &str,
        path: &str,
        content_range: &Option<Range>,
    ) -> Self {
        Self::error(
            notice::base::Code::ExperimentalFlagNotEnabled,
            format!("Experimental feature \"{}\" not enabled", feature),
            Some(path.to_string()),
            content_range.clone(),
        )
    }
    pub fn reference_not_found(path: &str, content_range: &Option<Range>) -> Self {
        Self::error(
            notice::base::Code::ReferenceNotFound,
            "Reference not found".to_string(),
            Some(path.to_string()),
            content_range.clone(),
        )
    }
}

impl NoticeList {
    pub fn new() -> Self {
        Self { items: vec![] }
    }
    pub fn extend(&mut self, other: &NoticeList) {
        self.items.extend(other.items.clone());
    }
    pub fn extend_from_option(&mut self, other: Option<NoticeList>) {
        if let Some(other) = other {
            self.items.extend(other.items.clone());
        }
    }
    pub fn contains_error(&self) -> bool {
        self.items
            .iter()
            .any(|notice| notice.level == notice::base::Level::Error.into())
    }
    pub fn has_some(&self) -> bool {
        !self.items.is_empty()
    }
    pub fn into_result<TRet>(self, ret: TRet) -> Result<TRet, NoticeList> {
        if self.contains_error() {
            Err(self)
        } else {
            Ok(ret)
        }
    }
    pub fn from(notice: Notice) -> Self {
        Self {
            items: vec![notice],
        }
    }
}

impl fmt::Display for NoticeList {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for notice in &self.items {
            write!(f, "{}", notice.message)?;
        }
        Ok(())
    }
}

impl Error for NoticeList {}
