use super::config::Config;
use anyhow::Result;
use super::project_compiler::ProjectCompiler;
use glob::glob;
use paperclip_parser::graph::graph::{Graph};
use path_absolutize::*;
use std::path::Path;
use std::rc::Rc;
use super::project_io::ProjectGraphIO;

#[derive(Debug)]
pub struct Project {

    /// The project config that specifies source information
    /// and how to compile the project
    pub config: Rc<Config>,

    /// The dependency graph of all PC files 
    pub graph: Rc<Graph>,

    /// The current project directory
    pub directory: String,

    pub compiler: ProjectCompiler
}

impl Project {

    /// Loads the project + dependency graph
    pub async fn load(directory: &str, file_name: Option<String>) -> Result<Self> {
        load_project(directory, file_name).await
    }

    /// Compiles the project given the config
    pub async fn compile(&self) -> Result<()> {
        self.compiler.compile_all().await?;
        Ok(())
    }
}

async fn load_project(directory: &str, file_name: Option<String>) -> Result<Project> {
    let config = Rc::new(Config::load(directory, file_name)?);

    let graph_io = ProjectGraphIO {};
    let mut graph = Graph::new();
    load_project_pc_files(&mut graph, graph_io, &config, directory).await;
    let graph = Rc::new(graph);

    Ok(Project {
        config: config.clone(),
        graph: graph.clone(),
        directory: String::from(directory),
        compiler: ProjectCompiler::load(config.clone(), graph.clone())
    })
}

async fn load_project_pc_files<'io>(
    graph: &mut Graph,
    io: ProjectGraphIO,
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

    graph.load_files(all_files, &io).await;
}
