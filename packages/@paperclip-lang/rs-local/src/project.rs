use super::config::Config;
pub use super::project_compiler::ProjectCompiler;
use super::project_io::{LocalIO, ProjectIO};
use anyhow::Result;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_parser::graph::graph::Graph;
use std::collections::HashMap;
use std::rc::Rc;
use wax::Glob;

pub struct CompileOptions {
    pub watch: bool,
}

pub struct Project<IO: ProjectIO> {
    /// The project config that specifies source information
    /// and how to compile the project
    pub config: Rc<Config>,

    /// The dependency graph of all PC files
    pub graph: Rc<Graph>,

    /// The current project directory
    pub directory: String,

    pub compiler: ProjectCompiler<IO>,

    /// IO for the project
    pub io: Rc<IO>,
}

impl<IO: ProjectIO> Project<IO> {
    /// Compiles the project given the config
    pub async fn compile(&self, options: CompileOptions) -> Result<HashMap<String, String>> {
        let files = self.compiler.compile_graph(&self.graph).await?;
        if options.watch {}

        Ok(files)
    }
}

impl Project<LocalIO> {
    pub async fn load(directory: &str, config_file_name: Option<String>) -> Result<Self> {
        let io = Rc::new(LocalIO {});
        let config = Rc::new(Config::load(directory, config_file_name)?);
        Ok(Self {
            config: config.clone(),
            io: io.clone(),
            graph: Rc::new(load_graph(directory, &config, &io).await),
            directory: directory.to_string(),
            compiler: ProjectCompiler::load(config.clone(), directory.to_string(), io.clone()),
        })
    }
}

async fn load_graph<'io>(directory: &str, config: &Config, io: &LocalIO) -> Graph {
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
