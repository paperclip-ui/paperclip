use super::core::Project;
use paperclip_parser::graph::Graph;
use wax::Glob;
use crate::config::Config;
use std::rc::Rc;
use std::cell::RefCell;
use crate::io::{ProjectIO, LocalIO};
use crate::project_compiler::ProjectCompiler;
use anyhow::Result;

impl Project<LocalIO> {
  pub async fn load(directory: &str, config_file_name: Option<String>) -> Result<Self> {
      let io = Rc::new(LocalIO {});
      let config = Rc::new(Config::load(directory, config_file_name)?);
      Ok(Self {
          config: config.clone(),
          io: io.clone(),
          graph: Rc::new(RefCell::new(load_graph::<LocalIO>(directory, &config, &io).await)),
          directory: directory.to_string(),
          compiler: ProjectCompiler::load(config.clone(), directory.to_string(), io.clone()),
      })
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
