use crate::config::{Config, ConfigContext};
use crate::io::ProjectIO;
pub use crate::project_compiler::CompileOptions;
use crate::project_compiler::ProjectCompiler;
use anyhow::Result;
use futures_core::stream::Stream;
use paperclip_parser::graph::Graph;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

///
/// The main entry point for managing a Paperclip project
///

pub struct Project<IO: ProjectIO> {
    /// The project config that specifies source information
    /// and how to compile the project
    pub config_context: Rc<ConfigContext>,

    /// The dependency graph of all PC files
    pub graph: Rc<RefCell<Graph>>,

    pub compiler: ProjectCompiler<IO>,

    /// IO for the project
    pub io: Rc<IO>,
}

impl<IO: ProjectIO> Project<IO> {
    ///
    /// Creates a new project with the given config context (also contains project directory)
    ///

    pub fn new(config_context: Rc<ConfigContext>, io: Rc<IO>) -> Self {
        Self {
            config_context: config_context.clone(),
            graph: Rc::new(RefCell::new(Graph::new())),
            compiler: ProjectCompiler::new(config_context.clone(), io.clone()),
            io,
        }
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
            .borrow_mut()
            .load_files::<IO>(files, &self.io)
            .await?;
        Ok(())
    }

    pub async fn load_file(&mut self, file: &str) -> Result<()> {
        self.graph.borrow_mut().load::<IO>(file, &self.io).await?;
        Ok(())
    }

    ///
    /// Compiles the _entire_ project and returns a stream of files.
    ///

    pub fn compile_all(
        &self,
        options: CompileOptions,
    ) -> impl Stream<Item = Result<(String, String), anyhow::Error>> + '_ {
        self.compiler.compile_graph(self.graph.clone(), options)
    }

    ///
    /// Explicitly compiles files that are part of this project

    pub async fn compile_files(&self, files: &Vec<String>) -> Result<HashMap<String, String>> {
        let mut graph = self.graph.borrow_mut();
        graph.load_files::<IO>(files, &self.io).await?;
        self.compiler.compile_files(files, &graph).await
    }
}
