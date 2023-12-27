use super::io::IO;
use anyhow::{Error, Result};
use paperclip_common::fs::{FileReader, FileResolver};
use std::collections::HashMap;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

#[derive(Clone)]
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
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>> {
        if let Some(content) = self.files.get(path) {
            Ok(content.as_bytes().to_vec().into_boxed_slice())
        } else {
            Err(Error::msg("file not found"))
        }
    }
    fn read_directory(&self, _path: &str) -> Result<Vec<paperclip_common::fs::FSItem>> {
        Err(Error::msg("Not implemented"))
    }
    fn get_file_size<'content>(&self, path: &str) -> Result<u64> {
        if let Some(content) = self.files.get(path) {
            Ok(content.as_bytes().len() as u64)
        } else {
            Err(Error::msg("file not found"))
        }
    }
    fn file_exists(&self, path: &str) -> bool {
        self.files.contains_key(path)
    }
}
impl<'kv> FileResolver for MockFS<'kv> {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Result<String> {
        let path = absolutize(Path::new(&from_path).parent().unwrap().join(to_path))
            .to_str()
            .unwrap()
            .to_string();

        if self.file_exists(&path) {
            Ok(path)
        } else {
            Err(Error::msg("File not found"))
        }
    }
}

#[cfg(feature = "local")]
fn absolutize(pt: PathBuf) -> PathBuf {
    use path_absolutize::*;
    pt.absolutize().unwrap()
}

#[cfg(not(feature = "local"))]
fn absolutize(pt: PathBuf) -> PathBuf {
    pt
}
