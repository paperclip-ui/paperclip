use anyhow::Result;
use paperclip_common::fs::{FileReader, FileWriter, LocalFileReader};
use paperclip_common::fs::{FileResolver, LocalFileResolver};
use paperclip_config::ConfigContext;
use paperclip_config::ConfigIO;
use paperclip_config::LocalIO as LocalConfigIO;
use paperclip_proto_ext::graph::io::IO as GraphIO;

pub trait ServerIO: GraphIO + ConfigIO + FileWriter<String> + 'static {}

#[derive(Clone, Default)]
pub struct LocalServerIO {}

impl FileReader for LocalServerIO {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        LocalFileReader::default().read_file(path)
    }
    fn get_file_size(&self, path: &str) -> Result<u64> {
        LocalFileReader::default().get_file_size(path)
    }
    fn read_directory(&self, path: &str) -> Result<Vec<paperclip_common::fs::FSItem>> {
        LocalFileReader::default().read_directory(path)
    }
    fn file_exists(&self, path: &str) -> bool {
        LocalFileReader::default().file_exists(path)
    }
}

impl FileWriter<String> for LocalServerIO {
    fn write_file<'content>(&self, path: &str, content: String) -> std::io::Result<()> {
        std::fs::write(path, content)
    }
    fn create_directory<'content>(&self, path: &str) -> std::io::Result<()> {
        std::fs::create_dir(path)
    }
}

impl ConfigIO for LocalServerIO {
    fn get_all_designer_files(&self, config_context: &ConfigContext) -> Vec<String> {
        LocalConfigIO::default().get_all_designer_files(config_context)
    }
}

impl FileResolver for LocalServerIO {
    fn resolve_file(&self, from: &str, to: &str) -> Result<String> {
        LocalFileResolver::default().resolve_file(from, to)
    }
}

impl ServerIO for LocalServerIO {}
impl GraphIO for LocalServerIO {}
