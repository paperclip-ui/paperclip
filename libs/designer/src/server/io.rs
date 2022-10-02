use anyhow::Result;
use paperclip_common::fs::{FileReader, LocalFileReader};
use paperclip_common::fs::{FileResolver, LocalFileResolver};
use paperclip_config::ConfigContext;
use paperclip_config::ConfigIO;
use paperclip_config::LocalIO as LocalConfigIO;
use paperclip_parser::graph::io::IO as GraphIO;

pub trait ServerIO: GraphIO + ConfigIO + 'static {}

#[derive(Clone, Default)]
pub struct LocalServerIO {}

impl FileReader for LocalServerIO {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        LocalFileReader::default().read_file(path)
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        LocalFileReader::default().get_file_size(path)
    }
}

impl ConfigIO for LocalServerIO {
    fn get_all_designer_files(&self, config_context: &ConfigContext) -> Vec<String> {
        LocalConfigIO::default().get_all_designer_files(config_context)
    }
}

impl FileResolver for LocalServerIO {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String> {
        LocalFileResolver::default().resolve_file(from, to)
    }
}

impl ServerIO for LocalServerIO {}
impl GraphIO for LocalServerIO {}
