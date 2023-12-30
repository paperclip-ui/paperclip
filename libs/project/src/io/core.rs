use paperclip_common::fs::FileWatcher;
use paperclip_core::config::ConfigIO;
use paperclip_core::proto::graph::io::IO as GraphIO;

pub trait ProjectIO: ConfigIO + FileWatcher + GraphIO + Clone + Send + Sync {}
