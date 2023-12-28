use super::core::ProjectIO;
use crate::utils::watch_local::async_watch;
use anyhow::{Error, Result};
use async_stream::stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::{
    FileReader, FileResolver, FileWatchEvent, FileWatchEventKind, FileWatcher, LocalFileReader,
};
use paperclip_config::{ConfigContext, ConfigIO};
use paperclip_proto_ext::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::path::Path;
use std::pin::Pin;
use wax::Glob;

#[derive(Clone)]
pub struct LocalIO {
    pub config_context: ConfigContext,
}

impl LocalIO {
    pub fn new(config_context: ConfigContext) -> Self {
        Self { config_context }
    }
}
impl GraphIO for LocalIO {}
impl ProjectIO for LocalIO {}

impl FileWatcher for LocalIO {
    fn watch(&self, directory: &str) -> Pin<Box<dyn Stream<Item = FileWatchEvent>>> {
        let dir = directory.to_string();
        Box::pin(stream! {
            let s = async_watch(dir);
            pin_mut!(s);
            while let Some(Ok(event)) = s.next().await {
                for path in &event.paths {
                    let path = path.clone().into_os_string().into_string().unwrap();
                    match &event.kind {
                        notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) => {
                            yield FileWatchEvent::new(FileWatchEventKind::Change, &path);
                        }
                        notify::EventKind::Create(_) => {
                            yield FileWatchEvent::new(FileWatchEventKind::Create, &path);
                        }
                        notify::EventKind::Remove(_) => {

                            yield FileWatchEvent::new(FileWatchEventKind::Remove, &path);
                        },
                        _ => {}
                    }
                }
            }
        })
    }
}
impl ConfigIO for LocalIO {
    fn get_all_designer_files(&self) -> Vec<String> {
        let pattern = self
            .config_context
            .config
            .get_relative_source_files_glob_pattern();
        let glob = Glob::new(pattern.as_str()).unwrap();
        let mut all_files: Vec<String> = vec![];

        for entry in glob.walk(&self.config_context.directory) {
            let entry = entry.unwrap();
            all_files.push(String::from(entry.path().to_str().unwrap()));
        }

        all_files
    }
}

impl FileReader for LocalIO {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        LocalFileReader::default().read_file(path)
    }
    fn read_directory(&self, path: &str) -> Result<Vec<paperclip_common::fs::FSItem>> {
        LocalFileReader::default().read_directory(path)
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        LocalFileReader::default().get_file_size(path)
    }
    fn file_exists(&self, path: &str) -> bool {
        LocalFileReader::default().file_exists(path)
    }
}

impl FileResolver for LocalIO {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Result<String> {
        let resolved = self
            .config_context
            .resolve_path(to_path)
            .unwrap_or(String::from(
                Path::new(from_path)
                    .parent()
                    .unwrap()
                    .join(to_path)
                    .absolutize()
                    .unwrap()
                    .to_str()
                    .unwrap(),
            ));

        if !self.file_exists(&resolved) {
            Err(Error::msg("file does not exist"))
        } else {
            Ok(resolved)
        }
    }
}
