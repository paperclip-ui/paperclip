use crate::css;
use crate::html;
use anyhow::Result;
use paperclip_common::get_or_short;
use paperclip_parser::graph;
use std::collections::HashMap;

pub struct EvalInfo {
    css: css::virt::Document,
    html: html::virt::Document,
}

pub struct Runtime {
    cache: HashMap<String, EvalInfo>,
}

impl Runtime {
    pub fn new() -> Self {
        Runtime {
            cache: HashMap::new(),
        }
    }
    pub fn evaluate(path: &str, graph: graph::Graph) -> Result<HashMap<String, &EvalInfo>> {
        let mut eval_result = HashMap::new();

        let mut dep_paths = vec![path.to_string()];

        dep_paths.extend(
            graph
                .get_all_dependents(path)
                .iter()
                .map(|dep| dep.path.to_string())
                .collect::<Vec<String>>(),
        );

        for path in &dep_paths {
            let dep = get_or_short!(
                graph.dependencies.get(path),
                Err(anyhow::Error::msg(format!(
                    "Dependency {} does not exist",
                    path
                )))
            );
        }

        Ok(eval_result)
    }
}
