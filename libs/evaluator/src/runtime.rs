use crate::css;
use crate::html;
use anyhow::Result;
use paperclip_parser::graph;
use paperclip_common::fs::FileResolver;


// #[derive(Debug)]
// pub struct EvalInfo(css::virt::Document, html::virt::Document);

pub struct Runtime {
    // cache: HashMap<String, EvalInfo>,
}

impl Runtime {
    pub fn new() -> Self {
        Runtime {
            // cache: HashMap::new(),
        }
    }
    pub async fn evaluate<FR: FileResolver>(&mut self, path: &str, graph: &graph::Graph, file_resolver: &FR) -> Result<(css::virt::Document, html::virt::Document)> {
        Ok((
            css::evaluator::evaluate(&path, graph, file_resolver).await?,
            html::evaluator::evaluate(&path, graph, file_resolver, html::context::Options {
                include_components: true
            }).await?
        ))
    }
}
