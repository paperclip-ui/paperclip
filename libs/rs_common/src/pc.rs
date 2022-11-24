use std::ffi::OsStr;
use std::path::Path;

pub fn is_paperclip_file(path: &str) -> bool {
    Path::new(path).extension() == Some(OsStr::new("pc"))
}
