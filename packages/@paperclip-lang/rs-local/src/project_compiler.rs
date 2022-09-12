use super::config::{CompilerOptions, Config};
use super::target_compiler::TargetCompiler;
use anyhow::Result;
use paperclip_common::fs::FileReader;
use paperclip_common::fs::FileResolver;
use paperclip_parser::graph::graph::{Dependency, Graph};
use std::collections::HashMap;
use std::rc::Rc;

pub struct ProjectCompiler<IO: FileReader + FileResolver> {
    targets: Vec<TargetCompiler<IO>>,
    config: Rc<Config>,
    graph: Rc<Graph>,
    project_dir: String,
}

impl<IO: FileReader + FileResolver> ProjectCompiler<IO> {
    pub fn load(config: Rc<Config>, graph: Rc<Graph>, project_dir: String, io: Rc<IO>) -> Self {
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
            project_dir,
            config: config.clone(),
            graph,
        }
    }
    pub async fn compile(&self) -> Result<HashMap<String, String>> {
        let mut all_files = HashMap::new();
        for target in &self.targets {
            all_files.extend(target.compile_graph(&self.graph).await?);
        }

        Ok(all_files)
    }
}
