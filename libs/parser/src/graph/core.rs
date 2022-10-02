use super::io::IO;
use crate::pc::ast;
use crate::pc::parser::parse as parse_pc;
use anyhow::Result;
use crc::crc32;
use futures::future::BoxFuture;
use futures::lock::Mutex;
use std::collections::{HashMap, HashSet};
use std::str;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct Dependency {
    pub hash: String,
    pub path: String,
    pub imports: HashMap<String, String>,
    pub document: ast::Document,
}

#[derive(Debug, Clone)]
pub struct Graph {
    pub dependencies: HashMap<String, Dependency>,
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

    pub async fn load<TIO: IO>(&mut self, path: &str, io: &TIO) -> Result<()> {
        self.dependencies.extend(
            load_dependencies::<TIO>(
                String::from(path),
                Arc::new(&io),
                Arc::new(Mutex::new(HashMap::new())),
            )
            .await?,
        );
        Ok(())
    }

    pub async fn load_files<TIO: IO>(&mut self, paths: &Vec<String>, io: &TIO) -> Result<()> {
        let loaded = self.dep_hashes(paths);
        for path in paths {
            self.load_file2(&path, io, loaded.clone()).await?;
        }
        Ok(())
    }

    pub async fn load_into_partial<TIO: IO>(&self, paths: &Vec<String>, io: &TIO) -> Result<Graph> {
        let mut other = Graph::new();
        let loaded = self.dep_hashes(paths);
        for path in paths {
            other.load_file2(&path, io, loaded.clone()).await?;
        }
        Ok(other)
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
    fn dep_hashes(&self, omit: &Vec<String>) -> Arc<Mutex<HashMap<String, String>>> {
        Arc::new(Mutex::new(HashMap::from_iter(
            self.dependencies
                .iter()
                .filter(|(path, _)| !omit.contains(path))
                .map(|(path, dep)| (path.to_string(), dep.hash.to_string())),
        )))
    }
    pub async fn load_file<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
    ) -> Result<HashMap<String, &Dependency>> {
        self.load_file2(path, io, self.dep_hashes(&vec![])).await
    }

    async fn load_file2<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
        loaded: Arc<Mutex<HashMap<String, String>>>,
    ) -> Result<HashMap<String, &Dependency>> {
        let new_dependencies =
            load_dependencies_wrapper::<TIO>(path.to_string(), Arc::new(&io), loaded).await?;

        let new_dep_keys = new_dependencies
            .keys()
            .map(|key| key.to_string())
            .collect::<Vec<String>>();

        self.dependencies.extend(new_dependencies);

        let mut ret = HashMap::new();

        for file_path in new_dep_keys {
            ret.insert(
                file_path.to_string(),
                self.dependencies.get(&file_path).unwrap(),
            );
        }

        Ok(ret)
    }
}

/**
 * Asynchronously loads
 */

async fn load_dependencies<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    loaded: Arc<Mutex<HashMap<String, String>>>,
) -> Result<HashMap<String, Dependency>> {
    let mut deps = HashMap::new();
    let mut imports: HashMap<String, String> = HashMap::new();

    let content = str::from_utf8(&*io.read_file(&path)?).unwrap().to_string();
    let hash = format!("{:x}", crc32::checksum_ieee(content.as_bytes())).to_string();

    if loaded.lock().await.get(&path) == Some(&hash) {
        return Ok(deps);
    }

    loaded
        .lock()
        .await
        .insert(path.to_string(), hash.to_string());

    let document = if let Ok(document) = parse_pc(content.as_str(), &path) {
        document
    } else {
        // TODO: this needs to be bubbled
        println!("Failed to parse {}", path);
        return Ok(deps);
    };

    for import in &document.get_imports() {
        io.resolve_file(&path, &import.path)
            .and_then(|import_path| imports.insert(import.path.to_string(), import_path));
    }

    deps.insert(
        path.to_string(),
        Dependency {
            hash,
            path: path.to_string(),
            imports: imports.clone(),
            document,
        },
    );

    if imports.len() > 0 {
        for path in imports.values() {
            deps.extend(load_dependencies_wrapper(path.clone(), io.clone(), loaded.clone()).await?);
        }
    }

    return Ok(deps);
}

fn load_dependencies_wrapper<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    loaded: Arc<Mutex<HashMap<String, String>>>,
) -> BoxFuture<'io, Result<HashMap<String, Dependency>>> {
    Box::pin(load_dependencies(path, io, loaded))
}
