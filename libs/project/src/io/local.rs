use super::core::ProjectIO;
use crate::utils::watch_local::async_watch;
use anyhow::{Result};
use async_stream::stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::{
    FileReader, FileResolver, FileWatchEvent, FileWatchEventKind, FileWatcher, LocalFileReader,
};
use paperclip_config::{ConfigContext, ConfigIO};
use paperclip_parser::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::path::Path;
use wax::Glob;

#[derive(Clone, Default)]
pub struct LocalIO;
impl GraphIO for LocalIO {}
impl ProjectIO for LocalIO {}

impl FileWatcher for LocalIO {
    type Str = impl Stream<Item = FileWatchEvent>;
    fn watch(&self, directory: &str) -> Self::Str {
        let dir = directory.to_string();
        stream! {
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
        }
    }
}
impl ConfigIO for LocalIO {
    fn get_all_designer_files(&self, config_context: &ConfigContext) -> Vec<String> {
        let pattern = config_context
            .config
            .get_relative_source_files_glob_pattern();
        let glob = Glob::new(pattern.as_str()).unwrap();
        let mut all_files: Vec<String> = vec![];

        for entry in glob.walk(&config_context.directory) {
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
