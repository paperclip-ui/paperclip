use anyhow::Result;
use futures_core::stream::Stream;

pub trait FileReader {
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>>;
}

pub trait FileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String>;
}

#[derive(Debug)]
pub enum FileWatchEventKind {
    Create,
    Remove,
    Change,
}

#[derive(Debug)]
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
