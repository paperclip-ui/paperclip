use super::config::Config;
use super::project_compiler::ProjectCompiler;
use super::project_io::{LocalIO, ProjectIO};
use anyhow::Result;
use glob::glob;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_parser::graph::graph::Graph;
use path_absolutize::*;
use std::collections::HashMap;
use std::path::Path;
use std::rc::Rc;

pub struct Project<IO: FileReader + FileResolver> {
    /// The project config that specifies source information
    /// and how to compile the project
    pub config: Rc<Config>,

    /// The dependency graph of all PC files
    pub graph: Rc<Graph>,

    /// The current project directory
    pub directory: String,

    pub compiler: ProjectCompiler<IO>,
}

impl<IO: FileReader + FileResolver> Project<IO> {
    /// Compiles the project given the config
    pub async fn compile(&self) -> Result<HashMap<String, String>> {
        self.compiler.compile().await
    }

    pub async fn watch(&self) {
        // TODO
    }
}

impl Project<LocalIO> {
    /// Loads the project + dependency graph
    pub async fn load(directory: &str, file_name: Option<String>) -> Result<Project<LocalIO>> {
        load_project(directory, file_name).await
    }
}

async fn load_project(directory: &str, file_name: Option<String>) -> Result<Project<LocalIO>> {
    let config = Rc::new(Config::load(directory, file_name)?);

    let graph_io = LocalIO {};
    let mut graph = Graph::new();
    load_project_pc_files(&mut graph, &graph_io, &config, directory).await;
    let graph = Rc::new(graph);

    Ok(Project {
        config: config.clone(),
        graph: graph.clone(),
        directory: String::from(directory),
        compiler: ProjectCompiler::load(
            config.clone(),
            graph.clone(),
            directory.to_string(),
            Rc::new(graph_io),
        ),
    })
}

async fn load_project_pc_files<'io>(
    graph: &mut Graph,
    io: &LocalIO,
    config: &Config,
    directory: &str,
) {
    let source_file_paths_pattern = String::from(
        Path::new(directory)
            .join(&config.get_relative_source_files_glob_pattern())
            .absolutize()
            .unwrap()
            .to_str()
            .unwrap(),
    );

    let mut all_files: Vec<String> = vec![];

    if let Ok(files) = glob(&source_file_paths_pattern) {
        for file in files {
            match file {
                Ok(file) => {
                    all_files.push(String::from(file.to_str().unwrap()));
                }
                _ => {}
            }
        }
    }

    graph.load_files(all_files, io).await;
}
