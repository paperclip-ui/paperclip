use anyhow::Error;
use anyhow::Result;
use futures_core::stream::Stream;
use path_absolutize::*;
use std::fs;
use std::path::Path;

pub trait FileReader {
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>>;
    fn get_file_size(&self, path: &str) -> Result<u64>;
}

#[derive(Default)]
pub struct LocalFileReader;

impl FileReader for LocalFileReader {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        if let Ok(content) = fs::read_to_string(path) {
            Ok(content.as_bytes().to_vec().into_boxed_slice())
        } else {
            Err(Error::msg("file not found"))
        }
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        if let Ok(metadata) = fs::metadata(path) {
            Ok(metadata.len())
        } else {
            Err(Error::msg("file not found"))
        }
    }
}

pub trait FileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String>;
}

#[derive(Default)]
pub struct LocalFileResolver;

impl FileResolver for LocalFileResolver {
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

#[derive(Debug, Clone)]
pub enum FileWatchEventKind {
    Create,
    Remove,
    Change,
}

#[derive(Debug, Clone)]
pub struct FileWatchEvent {
    pub kind: FileWatchEventKind,
    pub path: String,
}

impl FileWatchEvent {
    pub fn new(kind: FileWatchEventKind, path: &str) -> Self {
        Self {
            kind,
            path: path.to_string(),
        }
    }
}

pub trait FileWatcher: Clone + Send + Sync {
    type Str: Stream<Item = FileWatchEvent>;
    fn watch(&self, path: &str) -> Self::Str;
}
