use crate::config::Config;
use crate::io::ProjectIO;
use crate::project_compiler::ProjectCompiler;
use anyhow::Result;
use async_stream::try_stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::get_or_short;
use paperclip_parser::graph::Graph;
use std::cell::RefCell;
use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::Path;
use std::rc::Rc;

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

    /// used to flag before compiler
    dep_cache: RefCell<HashMap<String, String>>,

    /// compile output cache - prevents things from being emitted that already have been
    compile_cache: RefCell<HashMap<String, String>>,

    /// IO for the project
    pub io: Rc<IO>,
}

impl<IO: ProjectIO> Project<IO> {
    ///
    pub fn new(
        config: Rc<Config>,
        directory: String,
        compiler: ProjectCompiler<IO>,
        io: Rc<IO>,
    ) -> Self {
        Self {
            config,
            graph: Rc::new(RefCell::new(Graph::new())),
            directory,
            compiler,
            compile_cache: RefCell::new(HashMap::new()),
            dep_cache: RefCell::new(HashMap::new()),
            io,
        }
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

    pub async fn load(
        directory: &str,
        config_file_name: Option<String>,
        io: Rc<IO>,
    ) -> Result<Self> {
        let config = Rc::new(Config::load::<IO>(directory, config_file_name, io.clone())?);

        Ok(Self::new(
            config.clone(),
            directory.to_string(),
            ProjectCompiler::load(config.clone(), directory.to_string(), io.clone()),
            io.clone(),
        ))
    }

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

                    // keep tabs on immediately compiled files so that we prevent them from being emitted later if
                    // in watch mode and they haven't changed.
                    self.compile_cache.borrow_mut().insert(file_path.to_string(), content.to_string());
                    yield (file_path.to_string(), content.to_string());
                }
            }

            if options.watch {
                let s = self.io.watch(&self.directory);
                pin_mut!(s);
                while let Some(value) = s.next().await {

                    // Only touch PC files since it's the only thing that we can compile
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
        graph.load_file::<IO>(path, &self.io).await?;

        let dep = get_or_short!(graph.dependencies.get(path), Ok(HashMap::new()));

        // If the file being reloaded contains the same hash as a previously compiled file,
        // then don't emit anything - this even goes for related dependents since there
        // are no cascading changes
        if self.dep_cache.borrow().get(&dep.path) == Some(&dep.hash) {
            return Ok(HashMap::new());
        }

        // grab all dependents because of cascading changes
        let mut deps_to_compile = graph.get_all_dependents(path);
        deps_to_compile.push(dep);

        // store the hash of the dep so that we can shortcircuit early
        for dep in &deps_to_compile {
            self.dep_cache
                .borrow_mut()
                .insert(dep.path.to_string(), dep.hash.to_string());
        }

        let files_to_compile: Vec<String> = deps_to_compile
            .iter()
            .map(|dep| dep.path.to_string())
            .collect();

        let compiled_files: HashMap<String, String> = self
            .compiler
            .compile_files(&files_to_compile, &graph)
            .await?
            .into_iter()
            .filter(|(path, content)| self.compile_cache.borrow().get(path) != Some(content))
            .collect();

        self.compile_cache
            .borrow_mut()
            .extend(compiled_files.clone());

        Ok(compiled_files)
    }
}
