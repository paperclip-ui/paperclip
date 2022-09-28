use paperclip_common::fs::{FileWatcher, FileWatchEvent};
use std::collections::HashMap;
use anyhow::Result;
use futures_core::stream::Stream;

#[derive(Clone)]
struct ServerProjectIO {
  cache: HashMap<String, Vec<u8>>
}

impl ServerProjectIO {
  fn update_virtual_contents(&self, content: Vec<u8>) {

  }
}

impl FileWatcher for ServerProjectIO {
  type Str: Stream<Item = FileWatchEvent>;
  fn watch(&self, path: &str) -> Self::Str {
    
  }
}