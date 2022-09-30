use anyhow::Result;
use paperclip_common::fs::{FileReader, LocalFileReader};
use paperclip_config::ConfigContext;
use paperclip_config::ConfigIO;
use paperclip_config::LocalIO as LocalConfigIO;

pub trait ServerIO: ConfigIO + 'static {}

#[derive(Clone, Default)]
pub struct LocalServerIO {}

impl FileReader for LocalServerIO {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        LocalFileReader::default().read_file(path)
    }
}

impl ConfigIO for LocalServerIO {
    fn get_all_designer_files(&self, config_context: &ConfigContext) -> Vec<String> {
        LocalConfigIO::default().get_all_designer_files(config_context)
    }
}

impl ServerIO for LocalServerIO {}
