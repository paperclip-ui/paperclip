use anyhow::Result;
use neon::prelude::*;
use paperclip_project::io::{LocalIO, ProjectIO};
use paperclip_project::Project;
use std::collections::HashMap;
use std::rc::Rc;

pub struct Loader<TIO: ProjectIO> {
    pub(crate) project: Project<TIO>,
}

impl<TIO: ProjectIO> Loader<TIO> {
    pub async fn start(directory: &str, config_name: &str, io: Rc<TIO>) -> Result<Self> {
        Ok(Self {
            project: Project::load(directory, Some(config_name.to_string()), io).await?,
        })
    }
    pub async fn compile_file(&self, content: &str, file_path: &str) -> Result<HashMap<String, String>> {
        self.project.compile_files(&vec![file_path.to_string()]).await
    }
}

impl Finalize for Loader<LocalIO> {}
