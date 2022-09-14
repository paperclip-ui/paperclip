use paperclip_parser::graph::io::IO as GraphIO;
use futures_core::stream::Stream;

#[derive(Debug)]
pub enum WatchEventKind {
    Create,
    Remove,
    Change
}

#[derive(Debug)]
pub struct WatchEvent {
    pub kind: WatchEventKind,
    pub path: String
}

impl WatchEvent {
    pub fn new(kind: WatchEventKind, path: &str) -> Self {
        Self {
            kind,
            path: path.to_string()
        }
    }
}

pub trait ProjectIO: GraphIO {
    type Str: Stream<Item = WatchEvent>;
    fn watch(&self, dir: &str) -> Self::Str;
}
