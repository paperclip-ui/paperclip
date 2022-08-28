use super::config::{Config, CompilerOptions};
use paperclip_parser::graph::graph::{Graph, Dependency};
use std::rc::Rc;
use anyhow::Result;
use super::target_compiler::TargetCompiler;

#[derive(Debug)]
pub struct ProjectCompiler {
  targets: Vec<TargetCompiler>,
  config: Rc<Config>,
  graph: Rc<Graph>
}

impl ProjectCompiler {
  pub fn load(config: Rc<Config>, graph: Rc<Graph>) -> Self {
    Self {
      targets: if let Some(options) = &config.compiler_options {
        options.iter().map(|options| {
          TargetCompiler::load(options.clone())
        }).collect()
      } else {
        vec![]
      },
      config,
      graph
    }
  }
  pub async fn compile_all(&self) -> Result<()> {
    // TODO - return iterable
    for (path, dependency) in &self.graph.dependencies {
      for target in &self.targets {
        let compiled = target.compile_dependency(path, &self.graph).await?;
        // TODO - emit stream
      }
    }
    Ok(())
  }

}
