use futures_core::stream::Stream;
use paperclip_parser::graph::io::IO as GraphIO;

#[derive(Debug)]
pub enum WatchEventKind {
    Create,
    Remove,
    Change,
}

#[derive(Debug)]
pub struct WatchEvent {
    pub kind: WatchEventKind,
    pub path: String,
}

impl WatchEvent {
    pub fn new(kind: WatchEventKind, path: &str) -> Self {
        Self {
            kind,
            path: path.to_string(),
        }
    }
}

pub trait ProjectIO: GraphIO + Clone + Send + Sync {
    type Str: Stream<Item = WatchEvent>;
    fn watch(&self, dir: &str) -> Self::Str;
}
