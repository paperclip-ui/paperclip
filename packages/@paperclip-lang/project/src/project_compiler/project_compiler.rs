use crate::config::Config;
use crate::io::ProjectIO;
use crate::target_compiler::TargetCompiler;
use anyhow::Result;
use paperclip_parser::graph::graph::Graph;
use std::collections::HashMap;
use std::rc::Rc;

pub struct ProjectCompiler<IO: ProjectIO> {
    targets: Vec<TargetCompiler<IO>>,
    config: Rc<Config>,
    project_dir: String,
    io: Rc<IO>,
}

impl<IO: ProjectIO> ProjectCompiler<IO> {
    pub fn load(config: Rc<Config>, project_dir: String, io: Rc<IO>) -> Self {
        Self {
            targets: if let Some(options) = &config.compiler_options {
                options
                    .iter()
                    .map(|options| {
                        TargetCompiler::load(
                            options.clone(),
                            config.clone(),
                            project_dir.clone(),
                            io.clone(),
                        )
                    })
                    .collect()
            } else {
                vec![]
            },
            io: io.clone(),
            project_dir,
            config: config.clone(),
        }
    }
    pub async fn compile_graph(&self, graph: &Graph) -> Result<HashMap<String, String>> {
        self.compile_files(&graph.dependencies.keys().map(|key| {
            key.to_string()
        }).collect::<Vec<String>>(), graph).await
    }
    pub async fn compile_files(&self, files: &Vec<String>, graph: &Graph) -> Result<HashMap<String, String>> {
        let mut compiled_files = HashMap::new();
        for target in &self.targets {
            compiled_files.extend(target.compile_files(files, graph).await?);
        }

        Ok(compiled_files)
    }
}
