use super::io::IO;
use paperclip_common::fs::{FileReader, FileResolver};
use std::collections::HashMap;
use std::sync::Arc;

pub struct MockFS<'kv> {
    pub files: Arc<HashMap<&'kv str, &'kv str>>,
}

impl<'kv> MockFS<'kv> {
    pub fn new(files: HashMap<&'kv str, &'kv str>) -> Self {
        Self {
            files: Arc::new(files),
        }
    }
}

impl<'kv> IO for MockFS<'kv> {}

impl<'kv> FileReader for MockFS<'kv> {
    fn read_file<'content>(&self, path: &str) -> Option<Box<[u8]>> {
        if let Some(content) = self.files.get(path) {
            Some(content.as_bytes().to_vec().into_boxed_slice())
        } else {
            None
        }
    }
}
impl<'kv> FileResolver for MockFS<'kv> {
    fn resolve_file(&self, _from_path: &str, to_path: &str) -> Option<String> {
        Some(to_path.to_string())
    }
}
