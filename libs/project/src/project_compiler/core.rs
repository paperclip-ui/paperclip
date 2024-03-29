use crate::io::ProjectIO;
use crate::target_compiler::TargetCompiler;
use anyhow::Result;
use async_stream::stream;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::get_or_short;
use paperclip_common::pc::is_paperclip_file;
use paperclip_core::config::ConfigContext;
use paperclip_core::proto::graph::load::LoadableGraph;
use paperclip_proto::ast::graph_container::GraphContainer;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::notice::base::NoticeList;
use paperclip_validate::validate::{self, ValidateOptions};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub struct CompileOptions {
    pub initial: bool,
    pub watch: bool,
}

///
/// Project compiler + watching
///

pub struct ProjectCompiler<IO: ProjectIO> {
    targets: Vec<TargetCompiler<IO>>,

    /// used to flag before compiler
    dep_cache: Mutex<HashMap<String, String>>,

    config_context: ConfigContext,

    /// compile output cache - prevents things from being emitted that already have been
    compile_cache: Mutex<HashMap<String, Vec<u8>>>,

    /// IO for the project,
    pub io: IO,
}

impl<IO: ProjectIO> ProjectCompiler<IO> {
    ///
    /// Constructor for ProjectCompiler
    ///

    pub fn new(config_context: ConfigContext, io: IO) -> Self {
        Self {
            targets: if let Some(options) = &config_context.config.compiler_options {
                options
                    .iter()
                    .map(|options| {
                        TargetCompiler::new(options.clone(), config_context.clone(), io.clone())
                    })
                    .collect()
            } else {
                vec![]
            },
            config_context,
            compile_cache: Mutex::new(HashMap::new()),
            dep_cache: Mutex::new(HashMap::new()),
            io,
        }
    }

    ///
    /// Compiles a graph
    ///

    pub fn compile_graph<'a>(
        &'a self,
        graph: Arc<Mutex<Graph>>,
        options: CompileOptions,
    ) -> impl Stream<Item = Result<(String, Vec<u8>), NoticeList>> + '_ {
        stream! {
            let mut graph = graph.lock().unwrap();

            let config = &self.config_context.config;

            if options.initial {
                let mut compile_cache = self.compile_cache.lock().unwrap();

                let graph_files = graph
                .dependencies
                .keys()
                .map(|key| key.to_string())
                .collect::<Vec<String>>();

                let files = self.compile_files(&graph_files, &graph).await;
                if let Ok(files) = files {
                    for (file_path, content) in files {
                        // keep tabs on immediately compiled files so that we prevent them from being emitted later if
                        // in watch mode and they haven't changed.
                        compile_cache.insert(file_path.to_string(), content.clone());
                        yield Ok((file_path.to_string(), content.clone()));
                    }
                }


                let notice = validate::validate_documents(&graph_files, &self.io, &ValidateOptions::from_config(&config)).await;

                // Return errors and warnings.
                if notice.has_some() {
                    yield Err(notice);
                }
            }

            if options.watch {
                let s = self.io.watch(&self.config_context.directory);
                pin_mut!(s);
                while let Some(value) = s.next().await {
                    // Only touch PC files since it's the only thing that we can compile
                    if is_paperclip_file(&value.path) {

                        // blah, this shouldn't be happening.....
                        let _ = graph.load(&value.path, &self.io, self.config_context.config.into_parser_options()).await;

                        let graph_files = graph
                        .dependencies
                        .keys()
                        .map(|key| key.to_string())
                        .collect::<Vec<String>>();

                        let files = self.maybe_recompile_file(&value.path, &graph).await;
                        if let Ok(files) = files {
                            for (file_path, content) in files {
                                yield Ok((file_path.to_string(), content.clone()));
                            }
                        }

                        let notice = validate::validate_documents(&graph_files, &self.io, &ValidateOptions::from_config(&config)).await;

                        if notice.has_some() {
                            yield Err(notice);
                        }
                    }
                }
            }
        }
    }

    ///
    /// Compiles only a select number of files

    pub async fn compile_files<'graph>(
        &self,
        files: &Vec<String>,
        graph: &'graph Graph,
    ) -> Result<HashMap<String, Vec<u8>>, NoticeList> {
        let mut compiled_files = HashMap::new();
        let container = GraphContainer::new(graph);
        for target in &self.targets {
            compiled_files.extend(target.compile_files(files, &container).await?);
        }

        Ok(compiled_files)
    }

    ///
    /// Re-compiles a file only if it's necessary. Used in watcher
    ///

    async fn maybe_recompile_file(
        &self,
        path: &str,
        graph: &Graph,
    ) -> Result<HashMap<String, Vec<u8>>, NoticeList> {
        let dep = get_or_short!(graph.dependencies.get(path), Ok(HashMap::new()));

        let mut compile_cache = self.compile_cache.lock().unwrap();
        let mut dep_cache = self.dep_cache.lock().unwrap();

        // If the file being reloaded contains the same hash as a previously compiled file,
        // then don't emit anything - this even goes for related dependents since there
        // are no cascading changes
        if dep_cache.get(&dep.path) == Some(&dep.hash) {
            return Ok(HashMap::new());
        }

        // grab all dependents because of cascading changes
        let mut deps_to_compile = graph.get_all_dependents(path);
        deps_to_compile.push(dep);

        // store the hash of the dep so that we can shortcircuit early
        for dep in &deps_to_compile {
            dep_cache.insert(dep.path.to_string(), dep.hash.to_string());
        }

        let files_to_compile: Vec<String> = deps_to_compile
            .iter()
            .map(|dep| dep.path.to_string())
            .collect();

        let compiled_files: HashMap<String, Vec<u8>> = self
            .compile_files(&files_to_compile, &graph)
            .await?
            .into_iter()
            .filter(|(path, content)| compile_cache.get(path) != Some(content))
            .collect();

        compile_cache.extend(compiled_files.clone());

        Ok(compiled_files)
    }
}
