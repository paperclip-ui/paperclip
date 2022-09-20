use anyhow::Result;
use neon::prelude::*;
use paperclip_project::config::ConfigContext;
use paperclip_project::io::{LocalIO, ProjectIO};
use paperclip_project::Project;
use std::collections::HashMap;
use std::rc::Rc;

pub struct Loader<TIO: ProjectIO> {
    pub(crate) project: Project<TIO>,
}

impl<TIO: ProjectIO> Loader<TIO> {
    pub fn start(directory: &str, config_name: &str, io: Rc<TIO>) -> Result<Self> {
        let config_context = Rc::new(ConfigContext::load(
            directory,
            Some(config_name.to_string()),
            io.clone(),
        )?);

        Ok(Self {
            project: Project::new(config_context.clone(), io),
        })
    }
    pub async fn compile_file(&self, file_path: &str) -> Result<HashMap<String, String>> {
        self.project
            .compile_files(&vec![file_path.to_string()])
            .await
    }
}

impl Finalize for Loader<LocalIO> {}
