include!(concat!(env!("OUT_DIR"), "/ast.graph.rs"));

use std::collections::{HashMap, HashSet};

pub use super::graph_ext::*;
use super::pc::{Document, Element};

impl<'a> Dependency {
    pub fn resolve_import_from_ns(&'a self, ns: &str, graph: &'a Graph) -> Option<&'a Dependency> {
        let imp = self.get_document().get_import_by_ns(ns);
        if let Some(imp) = imp {
            if let Some(resolved_path) = self.imports.get(&imp.path) {
                graph.dependencies.get(resolved_path)
            } else {
                None
            }
        } else {
            None
        }
    }
    pub fn get_document(&self) -> &Document {
        self.document.as_ref().expect("Document must exist")
    }
    // pub fn find_instances_of(&self, component_name: &str, component_source: &str) -> Vec<&Element> {
    //     let import_rel_path = self
    //         .imports
    //         .iter()
    //         .find(|(key, value)| component_source == value.as_str());

    //     if import_rel_path.is_none() {
    //         return vec![];
    //     }

    //     self.get_document()

    //     vec![]
    // }
}

impl Graph {
    pub fn new() -> Self {
        Graph {
            dependencies: HashMap::new(),
        }
    }

    pub fn merge(self, graph: Graph) -> Graph {
        let mut dependencies = self.dependencies;
        dependencies.extend(graph.dependencies);
        Graph { dependencies }
    }
    pub fn get_immediate_dependents(&self, path: &str) -> Vec<&Dependency> {
        let mut dependents = vec![];
        for (_file_path, dep) in &self.dependencies {
            if dep
                .imports
                .values()
                .any(|resolved_path| resolved_path == path)
            {
                dependents.push(dep);
            }
        }
        dependents
    }
    pub fn get_all_dependents(&self, path: &str) -> Vec<&Dependency> {
        let mut all_dependents: Vec<&Dependency> = vec![];
        let mut used: HashSet<&str> = HashSet::new();
        let mut pool: Vec<&str> = vec![path];

        while let Some(path) = pool.pop() {
            let immediate_dependents = self.get_immediate_dependents(path);
            for dep in immediate_dependents {
                if !used.contains(&path) {
                    used.insert(path);
                    all_dependents.push(dep);
                    pool.push(&dep.path);
                }
            }
        }

        all_dependents
    }
    pub fn get_all_dependencies(&self, path: &str) -> Vec<&Dependency> {
        let mut all_dependencies: Vec<&Dependency> = vec![];
        let mut used: HashSet<&str> = HashSet::new();
        let mut pool: Vec<&str> = vec![path];

        while let Some(path) = pool.pop() {
            if let Some(dep) = self.dependencies.get(path) {
                for (_, imp_path) in &dep.imports {
                    if let Some(imp) = self.dependencies.get(imp_path) {
                        if !used.contains(imp_path.as_str()) {
                            used.insert(imp_path);
                            all_dependencies.push(imp);
                            pool.push(&imp_path);
                        }
                    }
                }
            } else {
                break;
            }
        }

        all_dependencies
    }
}
