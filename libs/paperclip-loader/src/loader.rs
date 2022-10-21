use anyhow::Result;
use neon::prelude::*;
use paperclip_config::ConfigContext;
use paperclip_project::{LocalIO, Project, ProjectIO};
use std::collections::HashMap;

pub struct Loader<TIO: ProjectIO> {
    pub(crate) project: Project<TIO>,
}

impl<TIO: ProjectIO> Loader<TIO> {
    pub fn start(directory: &str, config_name: &str, io: TIO) -> Result<Self> {
        let config_context = ConfigContext::load(directory, Some(config_name.to_string()), &io)?;

        Ok(Self {
            project: Project::new(config_context, io),
        })
    }
    pub fn get_config_context(&self) -> &ConfigContext {
        &self.project.config_context
    }
    pub async fn compile_file(&self, file_path: &str) -> Result<HashMap<String, String>> {
        self.project
            .compile_files(&vec![file_path.to_string()])
            .await
    }
}

impl Finalize for Loader<LocalIO> {}
