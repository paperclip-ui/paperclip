use super::core::Project;
use crate::config::Config;
use crate::io::{LocalIO, ProjectIO};
use crate::project_compiler::ProjectCompiler;
use anyhow::Result;
use paperclip_parser::graph::Graph;
use std::cell::RefCell;
use std::rc::Rc;
use wax::Glob;

impl Project<LocalIO> {
    pub async fn load(directory: &str, config_file_name: Option<String>) -> Result<Self> {
        let io = Rc::new(LocalIO {});
        let config = Rc::new(Config::load(directory, config_file_name)?);
        Ok(Self::new(
            config.clone(),
            Rc::new(RefCell::new(
                load_graph::<LocalIO>(directory, &config, &io).await,
            )),
            directory.to_string(),
            ProjectCompiler::load(config.clone(), directory.to_string(), io.clone()),
            io.clone(),
        ))
    }
}

async fn load_graph<'io, IO: ProjectIO>(directory: &str, config: &Config, io: &IO) -> Graph {
    let pattern = config.get_relative_source_files_glob_pattern();

    let glob = Glob::new(pattern.as_str()).unwrap();
    let mut all_files: Vec<String> = vec![];

    for entry in glob.walk(directory) {
        let entry = entry.unwrap();
        all_files.push(String::from(entry.path().to_str().unwrap()));
    }

    let mut graph = Graph::new();
    graph.load_files(all_files, io).await;
    graph
}
