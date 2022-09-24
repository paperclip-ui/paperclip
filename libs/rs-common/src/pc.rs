use std::path::Path;
use std::ffi::OsStr;


pub fn is_paperclip_file(path: &str) -> bool {
  Path::new(path).extension() == Some(OsStr::new("pc"))
}