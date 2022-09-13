use super::config::Config;
pub use super::project_compiler::ProjectCompiler;
use super::project_io::{LocalIO, ProjectIO};
use anyhow::Result;
use async_stream::try_stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_parser::graph::graph::Graph;
use std::collections::HashMap;
use std::rc::Rc;
use std::path::Path;
use std::ffi::OsStr;
use wax::Glob;
use std::cell::RefCell;

pub struct CompileOptions {
    pub watch: bool,
}

pub struct Project<IO: ProjectIO> {
    /// The project config that specifies source information
    /// and how to compile the project
    pub config: Rc<Config>,

    /// The dependency graph of all PC files
    pub graph: Rc<RefCell<Graph>>,

    /// The current project directory
    pub directory: String,

    pub compiler: ProjectCompiler<IO>,

    /// IO for the project
    pub io: Rc<IO>,
}

impl<IO: ProjectIO> Project<IO> {
    // type Str = impl Stream<Item = Result<(String, String)>>;
    /// Compiles the project given the config
    pub fn compile(
        &self,
        options: CompileOptions,
    ) -> impl Stream<Item = Result<(String, String), anyhow::Error>> + '_ {
        try_stream! {
            {
                let files = self.compiler.compile_graph(&self.graph.borrow()).await?;

                for (file_path, content) in files {
                    yield (file_path.to_string(), content.to_string());
                }
            }
            if options.watch {
                let s = self.io.watch(&self.directory);
                pin_mut!(s);
                while let Some(value) = s.next().await {

                    if Path::new(&value.path).extension() == Some(OsStr::new("pc")) {
                        for (file_path, content) in self.reload_file(&value.path).await? {
                            yield (file_path.to_string(), content.to_string());
                        }
                    }
                }
            }
        }
    }

    async fn reload_file(&self, path: &str) -> Result<HashMap<String, String>> {
        let mut graph = self.graph.borrow_mut();
        graph.load_file::<IO>(path, &self.io).await;
        let all_dependents = graph.get_all_dependents(path);

        let mut files_to_compile: Vec<String> = all_dependents.iter().map(|dep| {
            dep.path.to_string()
        }).collect();

        files_to_compile.push(path.to_string());
        
        let compiled_files = self.compiler.compile_files(&files_to_compile, &graph).await?;

        Ok(compiled_files)
    }
}

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
