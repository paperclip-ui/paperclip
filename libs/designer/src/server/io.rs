use anyhow::Result;
use async_stream::stream;
use futures::executor::block_on;
use futures::lock::Mutex;
use futures_core::stream::Stream;
use paperclip_common::event_bus::EventBus;
use paperclip_common::fs::{FileReader, FileWatchEvent, FileWatchEventKind, FileWatcher};
use paperclip_project::LocalIO;
use std::collections::HashMap;
use std::hash::Hash;
use std::sync::Arc;

#[derive(Clone)]
struct UpdatedVirtualContents {
    path: String,
}

#[derive(Clone)]
pub struct ServerProjectIO<TIO: FileReader + FileWatcher> {
    source: TIO,
    cache: HashMap<String, Vec<u8>>,
    file_watch_bus: Arc<Mutex<EventBus<FileWatchEvent>>>,
}

impl<TIO: FileReader + FileWatcher> ServerProjectIO<TIO> {
    pub fn update_virtual_contents(&mut self, path: &str, content: Vec<u8>) {
        self.cache.insert(path.to_string(), content);
        block_on(self.file_watch_bus.lock()).emit(FileWatchEvent {
            kind: FileWatchEventKind::Change,
            path: path.to_string(),
        });
    }
    pub fn read_file(&mut self, path: &str) -> Result<&Vec<u8>> {
        if self.cache.get(path) != None {
            Ok(self.cache.get(path).unwrap())
        } else {
            let content = self.source.read_file(path)?;
            self.cache.insert(path.to_string(), content.to_vec());
            let content = self.cache.get(path).unwrap();
            Ok(content)
        }
    }
    pub fn new(source: TIO) -> Self {
        Self {
            source,
            cache: HashMap::new(),
            file_watch_bus: Arc::new(Mutex::new(EventBus::new())),
        }
    }
}

impl<TIO: FileReader + FileWatcher> FileWatcher for ServerProjectIO<TIO> {
    type Str = impl Stream<Item = FileWatchEvent>;
    fn watch<'a>(&'a self, path: &str) -> Self::Str {
        let mut bus = block_on(self.file_watch_bus.lock());
        let chan = bus.subscribe();
        stream! {
          while let Ok(event) = chan.recv() {
            yield event;
          }
        }
    }
}
