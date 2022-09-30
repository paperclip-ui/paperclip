use anyhow::Error;
use anyhow::Result;
use futures_core::stream::Stream;
use std::fs;

pub trait FileReader {
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>>;
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
}

pub trait FileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String>;
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
