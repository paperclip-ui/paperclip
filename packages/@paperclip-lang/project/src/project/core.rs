use crate::config::Config;
use crate::project_compiler::ProjectCompiler;
use crate::io::{ProjectIO};
use anyhow::Result;
use async_stream::try_stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_parser::graph::Graph;
use std::collections::HashMap;
use std::rc::Rc;
use std::path::Path;
use std::ffi::OsStr;
use std::cell::RefCell;

pub struct CompileOptions {
    pub watch: bool,
}

/// Main entry point for handling a paperclip-based project

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

    /// 
    /// Compiles the _entire_ project and returns a stream of files.
    /// 

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

    ///
    /// Recompiles just one file and its _dependents_
    /// 

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
