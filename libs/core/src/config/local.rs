use super::io::ConfigIO;
use crate::config::ConfigContext;
use crate::proto::graph::io::IO as GraphIO;
use anyhow::{Error, Result};
use paperclip_common::fs::{FileReader, FileResolver, LocalFileReader};
use path_absolutize::*;
use std::path::Path;
use wax::Glob;

#[derive(Clone)]
pub struct LocalIO {
    pub config_context: ConfigContext,
}

impl LocalIO {
    pub fn new(config_context: ConfigContext) -> Self {
        Self { config_context }
    }
}

impl GraphIO for LocalIO {}
impl ConfigIO for LocalIO {
    fn get_all_designer_files(&self) -> Vec<String> {
        let pattern = self
            .config_context
            .config
            .get_relative_source_files_glob_pattern();
        let glob = Glob::new(pattern.as_str()).unwrap();
        let mut all_files: Vec<String> = vec![];

        for entry in glob.walk(&self.config_context.directory) {
            let entry = entry.unwrap();
            all_files.push(String::from(entry.path().to_str().unwrap()));
        }

        all_files
    }
}

impl FileReader for LocalIO {
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

impl FileResolver for LocalIO {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Result<String> {
        let resolved = String::from(
            Path::new(from_path)
                .parent()
                .unwrap()
                .join(to_path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap(),
        );
        if !self.file_exists(&resolved) {
            Err(Error::msg("file does not exist"))
        } else {
            Ok(resolved)
        }
    }
}
