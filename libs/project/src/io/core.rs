use paperclip_config::{ConfigIO};
use paperclip_common::fs::FileWatcher;
use paperclip_parser::graph::io::IO as GraphIO;

pub trait ProjectIO: ConfigIO + FileWatcher + GraphIO + Clone + Send + Sync {

}
