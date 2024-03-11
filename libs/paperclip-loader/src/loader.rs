use anyhow::Result;
use neon::prelude::*;
use paperclip_common::fs::LocalFileReader;
use paperclip_core::config::ConfigContext;
use paperclip_project::{LocalIO, Project};
use paperclip_proto::notice::base::NoticeList;
use std::collections::HashMap;

pub struct Loader {
    pub(crate) project: Project<LocalIO>,
}

impl Loader {
    pub fn start(directory: &str, config_name: &str) -> Result<Self> {
        let fr = LocalFileReader::default();
        let config_context = ConfigContext::load(directory, Some(config_name.to_string()), &fr)?;
        let io = LocalIO::new(config_context.clone());

        Ok(Self {
            project: Project::new(config_context, io),
        })
    }
    pub fn get_config_context(&self) -> &ConfigContext {
        &self.project.config_context
    }
    pub async fn compile_file(
        &self,
        file_path: &str,
    ) -> Result<HashMap<String, Vec<u8>>, NoticeList> {
        self.project
            .compile_files(&vec![file_path.to_string()])
            .await
    }
}

impl Finalize for Loader {}
