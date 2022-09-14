use super::core::{ProjectIO, WatchEvent, WatchEventKind};
use crate::utils::watch_local::async_watch;
use async_stream::stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_parser::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::fs;
use std::path::Path;

pub struct LocalIO;
impl GraphIO for LocalIO {}

impl ProjectIO for LocalIO {
    type Str = impl Stream<Item = WatchEvent>;
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
                            yield WatchEvent::new(WatchEventKind::Change, &path);
                        }
                        notify::EventKind::Create(_) => {
                            yield WatchEvent::new(WatchEventKind::Create, &path);
                        }
                        notify::EventKind::Remove(_) => {
                            yield WatchEvent::new(WatchEventKind::Remove, &path);
                        },
                        _ => {}
                    }
                }
            }
        }
    }
}

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
