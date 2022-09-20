use anyhow::Result;
use neon::prelude::*;
use paperclip_project::io::{LocalIO, ProjectIO};
use paperclip_project::Project;
use std::rc::Rc;

pub struct Loader<TIO: ProjectIO> {
    project: Project<TIO>,
}

impl<TIO: ProjectIO> Loader<TIO> {
    pub async fn start(directory: &str, config_name: &str, io: Rc<TIO>) -> Result<Self> {
        Ok(Self {
            project: Project::load(directory, Some(config_name.to_string()), io).await?,
        })
    }
    
}

impl Finalize for Loader<LocalIO> {}
