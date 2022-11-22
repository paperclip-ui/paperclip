use paperclip_common::fs::FileWatcher;
use paperclip_config::ConfigIO;
use paperclip_proto_ext::graph::io::IO as GraphIO;


pub trait ProjectIO: ConfigIO + FileWatcher + GraphIO + Clone + Send + Sync {}
