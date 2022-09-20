use crate::config::ConfigContext;
use crate::io::ProjectIO;
use crate::target_compiler::TargetCompiler;
use anyhow::Result;
use paperclip_parser::graph::Graph;
use std::collections::HashMap;
use std::rc::Rc;

pub struct ProjectCompiler<IO: ProjectIO> {
    targets: Vec<TargetCompiler<IO>>,
}

impl<IO: ProjectIO> ProjectCompiler<IO> {
    pub fn load(config_context: Rc<ConfigContext>, io: Rc<IO>) -> Self {
        Self {
            targets: if let Some(options) = &config_context.config.compiler_options {
                options
                    .iter()
                    .map(|options| {
                        TargetCompiler::load(options.clone(), config_context.clone(), io.clone())
                    })
                    .collect()
            } else {
                vec![]
            },
        }
    }
    pub async fn compile_graph(&self, graph: &Graph) -> Result<HashMap<String, String>> {
        self.compile_files(
            &graph
                .dependencies
                .keys()
                .map(|key| key.to_string())
                .collect::<Vec<String>>(),
            graph,
        )
        .await
    }
    pub async fn compile_files(
        &self,
        files: &Vec<String>,
        graph: &Graph,
    ) -> Result<HashMap<String, String>> {
        println!("ProjectCompiler::compile_files()");
        let mut compiled_files = HashMap::new();
        for target in &self.targets {
            compiled_files.extend(target.compile_files(files, graph).await?);
        }

        Ok(compiled_files)
    }
}
