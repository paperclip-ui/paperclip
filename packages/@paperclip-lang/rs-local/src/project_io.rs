use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_parser::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::fs;
use std::path::Path;

pub trait ProjectIO: GraphIO {}

pub struct LocalIO;
impl GraphIO for LocalIO {}
impl ProjectIO for LocalIO {}

impl FileReader for LocalIO {
    fn read_file(&self, path: &str) -> Option<Box<[u8]>> {
        if let Ok(content) = fs::read_to_string(path) {
            Some(content.as_bytes().to_vec().into_boxed_slice())
        } else {
            None
        }
    }
}

impl FileResolver for LocalIO {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Option<String> {
        Some(String::from(
            Path::new(from_path)
                .parent()
                .unwrap()
                .join(to_path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap(),
        ))
    }
}
