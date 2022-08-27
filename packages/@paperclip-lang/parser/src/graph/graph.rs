use super::io::IO;
use crate::pc::ast;
use crate::pc::parser::parse as parse_pc;
use crc::crc32;
use futures::future::{select_all, BoxFuture, Future, FutureExt};
use futures::lock::Mutex;
use std::collections::{HashMap, HashSet};
use std::marker::Sync;
use std::sync::Arc;

#[derive(Debug)]
pub struct Dependency {
    pub hash: String,
    pub path: String,
    pub imports: HashMap<String, String>,
    pub document: ast::Document,
}

#[derive(Debug)]
pub struct Graph {
    pub dependencies: HashMap<String, Dependency>,
}

impl Graph {
    pub fn new() -> Self {
        Graph {
            dependencies: HashMap::new(),
        }
    }
    pub async fn load<TIO: IO>(&mut self, path: &str, io: &TIO) {
        self.dependencies.extend(
            load_dependencies::<TIO>(
                String::from(path),
                Arc::new(&io),
                Arc::new(Mutex::new(HashSet::new())),
            )
            .await,
        );
    }
    pub async fn load_files<TIO: IO>(&mut self, paths: Vec<String>, io: &TIO) {
        for path in paths {
            self.dependencies.extend(
                load_dependencies_wrapper::<TIO>(
                    path.clone(),
                    Arc::new(&io),
                    Arc::new(Mutex::new(HashSet::new())),
                )
                .await,
            );
        }
    }
}

/**
 * Asynchronously loads
 */

async fn load_dependencies<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    loaded: Arc<Mutex<HashSet<String>>>, // dependencies: Arc<Mutex<HashMap<String, Dependency>>>,
) -> HashMap<String, Dependency> {
    let mut deps = HashMap::new();
    let mut imports: HashMap<String, String> = HashMap::new();

    {
        let mut loaded = loaded.lock().await;
        if loaded.contains(&path) {
            return deps;
        }
        loaded.insert(path.to_string());
    }

    let content = if let Some(content) = io.read(&path).await {
        content
    } else {
        println!("file not found {}", path);
        return deps;
    };

    let document = if let Ok(document) = parse_pc(content.as_str(), &path) {
        document
    } else {
        // TODO: this needs to be bubbled
        println!("Failed to parse {}", path);
        return deps;
    };

    for import in &document.get_imports() {
        io.resolve(&path, &import.path)
            .await
            .and_then(|import_path| imports.insert(import.path.to_string(), import_path));
    }

    deps.insert(
        path.to_string(),
        Dependency {
            hash: format!("{:x}", crc32::checksum_ieee(content.as_bytes())).to_string(),
            path: path.to_string(),
            imports: imports.clone(),
            document,
        },
    );

    if imports.len() > 0 {
        for path in imports.values() {
            deps.extend(load_dependencies_wrapper(path.clone(), io.clone(), loaded.clone()).await);
        }
    }

    return deps;
}

fn load_dependencies_wrapper<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    loaded: Arc<Mutex<HashSet<String>>>,
) -> BoxFuture<'io, HashMap<String, Dependency>> {
    Box::pin(load_dependencies(path, io, loaded))
}
