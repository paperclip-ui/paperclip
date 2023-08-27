use anyhow::Error;
use anyhow::Result;
use futures_core::stream::Stream;

#[cfg(feature = "local")]
use path_absolutize::*;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::Path;

pub enum FSItemKind {
    File,
    Directory,
}

pub struct FSItem {
    pub kind: FSItemKind,
    pub path: String,
}

pub trait FileReader: Clone {
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>>;
    fn get_file_size(&self, path: &str) -> Result<u64>;
    fn file_exists(&self, path: &str) -> bool;
    fn read_directory(&self, path: &str) -> Result<Vec<FSItem>>;
}
pub trait FileWriter<Content>: Clone {
    fn write_file<'content>(&self, path: &str, content: Content) -> std::io::Result<()>;
    fn create_directory<'content>(&self, path: &str) -> std::io::Result<()>;
}

#[derive(Default, Clone)]
pub struct LocalFileReader;

impl FileReader for LocalFileReader {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        let mut f = File::open(path)?;
        let metadata = fs::metadata(path)?;
        let mut buffer = vec![0; metadata.len() as usize];
        f.read(&mut buffer)?;
        Ok(buffer.into_boxed_slice())
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        if let Ok(metadata) = fs::metadata(path) {
            Ok(metadata.len())
        } else {
            Err(Error::msg(format!("file \"{}\" not found", path)))
        }
    }
    fn read_directory(&self, path: &str) -> Result<Vec<FSItem>> {
        let dir = Path::new(path);
        if dir.is_dir() {
            let mut items = vec![];
            for entry in fs::read_dir(dir)? {
                let entry = entry?;
                let path = entry.path();
                items.push(FSItem {
                    kind: if path.is_dir() {
                        FSItemKind::Directory
                    } else {
                        FSItemKind::File
                    },
                    path: path.clone().into_os_string().into_string().unwrap(),
                })
            }
            Ok(items)
        } else {
            Err(Error::msg(format!("directory \"{}\" not found", path)))
        }
    }
    fn file_exists(&self, path: &str) -> bool {
        Path::new(path).exists()
    }
}

pub trait FileResolver: Clone {
    fn resolve_file(&self, from: &str, to: &str) -> Result<String>;
}

#[cfg(feature = "local")]
#[derive(Default, Clone)]
pub struct LocalFileResolver;

#[cfg(feature = "local")]
impl FileResolver for LocalFileResolver {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Result<String> {
        Ok(String::from(
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
