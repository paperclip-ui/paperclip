use super::config::Config;
use anyhow::Result;
use futures::future::{BoxFuture, FutureExt};
use glob::glob;
use paperclip_parser::graph::graph::Graph;
use paperclip_parser::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::fs;
use std::path::Path;

#[derive(Debug)]
pub struct Project {
    pub config: Config,
    pub graph: Graph,
    pub directory: String,
}

impl Project {
    pub async fn load(directory: &str, file_name: Option<String>) -> Result<Self> {
        load_project(directory, file_name).await
    }
}

struct ProjectGraphIO {}

impl GraphIO for ProjectGraphIO {
    fn resolve(&self, from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>> {
        let ret: Option<String> = Some(String::from(
            Path::new(from_path)
                .join(to_path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap(),
        ));

        async { ret }.boxed()
    }
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>> {
        let ret = if let Ok(content) = fs::read_to_string(path) {
            Some(content.to_string())
        } else {
            None
        };

        async { ret }.boxed()
    }
}

async fn load_project(directory: &str, file_name: Option<String>) -> Result<Project> {
    let config = Config::load(directory, file_name)?;

    let graph_io = ProjectGraphIO {};
    let mut graph = Graph::new();
    load_project_pc_files(&mut graph, graph_io, &config, directory).await;

    Ok(Project {
        config,
        graph,
        directory: String::from(directory),
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

    graph.load_files(all_files, &io);
}
