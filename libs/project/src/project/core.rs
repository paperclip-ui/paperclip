use crate::config::{Config, ConfigContext};
use crate::io::ProjectIO;
pub use crate::project_compiler::CompileOptions;
use crate::project_compiler::ProjectCompiler;
use anyhow::Result;
use futures_core::stream::Stream;
use paperclip_parser::graph::Graph;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

///
/// The main entry point for managing a Paperclip project
///

pub struct Project<IO: ProjectIO> {
    /// The project config that specifies source information
    /// and how to compile the project
    pub config_context: ConfigContext,

    /// The dependency graph of all PC files
    pub graph: Arc<Mutex<Graph>>,

    pub compiler: ProjectCompiler<IO>,

    /// IO for the project
    pub io: IO,
}

impl<IO: ProjectIO> Project<IO> {
    ///
    /// Creates a new project with the given config context (also contains project directory)
    ///

    pub fn new(config_context: ConfigContext, io: IO) -> Self {
        Self {
            config_context: config_context.clone(),
            graph: Arc::new(Mutex::new(Graph::new())),
            compiler: ProjectCompiler::new(config_context.clone(), io.clone()),
            io,
        }
    }

    pub async fn load_all_files(&mut self) -> Result<()> {
        self.load_files(&self.io.get_all_designer_files(&self.config_context))
            .await
    }

    ///
    /// Returns the directory of the project
    ///

    pub fn get_directory(&self) -> &str {
        &self.config_context.directory
    }

    ///
    /// Return
    ///

    pub fn get_config(&self) -> &Config {
        &self.config_context.config
    }

    pub async fn load_files(&mut self, files: &Vec<String>) -> Result<()> {
        self.graph
            .lock()
            .unwrap()
            .load_files::<IO>(files, &self.io)
            .await?;
        Ok(())
    }

    pub async fn load_file(&mut self, file: &str) -> Result<()> {
        self.graph
            .lock()
            .unwrap()
            .load::<IO>(file, &self.io)
            .await?;

        Ok(())
    }

    ///
    /// Compiles the _entire_ project and returns a stream of files.
    ///

    pub fn compile_all<'a>(
        &self,
        options: CompileOptions,
    ) -> impl Stream<Item = Result<(String, String), anyhow::Error>> + '_ {
        self.compiler.compile_graph(self.graph.clone(), options)
    }

    ///
    /// Explicitly compiles files that are part of this project

    pub async fn compile_files(&self, files: &Vec<String>) -> Result<HashMap<String, String>> {
        let mut graph = self.graph.lock().unwrap();
        graph.load_files::<IO>(files, &self.io).await?;
        self.compiler.compile_files(files, &graph).await
    }
}
