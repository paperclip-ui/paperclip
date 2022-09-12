use super::config::{CompilerOptions, Config};
use super::target_compiler::TargetCompiler;
use anyhow::Result;
use paperclip_parser::graph::graph::{Dependency, Graph};
use std::collections::HashMap;
use std::rc::Rc;

pub struct ProjectCompiler {
    targets: Vec<TargetCompiler>,
    config: Config,
    graph: Rc<Graph>,
    project_dir: String,
}

impl ProjectCompiler {
    pub fn load(config: Config, graph: Rc<Graph>, project_dir: String) -> Self {
        Self {
            targets: if let Some(options) = &config.compiler_options {
                options
                    .iter()
                    .map(|options| {
                        TargetCompiler::load(options.clone(), config.clone(), project_dir.clone())
                    })
                    .collect()
            } else {
                vec![]
            },
            project_dir,
            config,
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
