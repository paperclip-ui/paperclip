use super::core::Project;
use crate::io::{LocalIO};
use anyhow::Result;
use std::rc::Rc;
use wax::Glob;

impl Project<LocalIO> {
    pub async fn load_local(directory: &str, config_file_name: Option<String>) -> Result<Self> {
        let mut project = Project::load(directory, config_file_name, Rc::new(LocalIO {})).await?;
        let pattern = project.config.get_relative_source_files_glob_pattern();
        let glob = Glob::new(pattern.as_str()).unwrap();
        let mut all_files: Vec<String> = vec![];

        for entry in glob.walk(directory) {
            let entry = entry.unwrap();
            all_files.push(String::from(entry.path().to_str().unwrap()));
        }

        project.load_files(&all_files).await?;

        Ok(project)
    }
}

unsafe impl Send for Project<LocalIO> {}
