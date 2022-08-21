use crate::pc::ast;
use crate::pc::parser::parse as parse_pc;
use crate::pc::symbol_table::{get_symbol_table, SymbolTableItem};
use crc::crc32;
use futures::future::{select_all, BoxFuture, Future, FutureExt};
use futures::lock::Mutex;
use std::collections::HashMap;
use std::marker::Sync;
use std::sync::Arc;

pub trait IO: Sync + Send {
    fn resolve(&self, from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>>;
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>>;
}

#[derive(Debug)]
pub struct Dependency {
    pub hash: String,
    pub path: String,
    pub imports: HashMap<String, String>,
    pub document: ast::Document,
}

#[derive(Debug)]
pub struct Graph {
    pub dependencies: Arc<Mutex<HashMap<String, Dependency>>>,
}

impl Graph {
    pub fn new() -> Self {
        Graph {
            dependencies: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    pub async fn load<TIO: IO>(&mut self, path: &str, io: &TIO) {
        load_dependencies::<TIO>(String::from(path), Arc::new(&io), self.dependencies.clone())
            .await;
    }
    pub async fn load_files<TIO: IO>(&mut self, paths: Vec<String>, io: &TIO) {
        for path in paths {
            load_dependencies_wrapper::<TIO>(
                path.clone(),
                Arc::new(&io),
                self.dependencies.clone(),
            )
            .await;
        }
    }
}

/**
 * Asynchronously loads
 */

async fn load_dependencies<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    dependencies: Arc<Mutex<HashMap<String, Dependency>>>,
) {
    let mut imports: HashMap<String, String> = HashMap::new();
    {
        let mut deps = dependencies.lock().await;
        if deps.contains_key(&path) {
            return;
        }

        if let Some(content) = io.read(&path).await {
            if let Ok(document) = parse_pc(content.as_str(), &path) {
                for import in &document.get_imports() {
                    io.resolve(&path, &import.path)
                        .await
                        .and_then(|import_path| {
                            imports.insert(import.path.to_string(), import_path)
                        });
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
            } else {
                // TODO: this needs to be bubbled
                println!("Failed to parse {}", path);
            }
        } else {
            println!("file not found {}", path);
        }
    }

    if imports.len() > 0 {
        select_all(
            imports.values().map(|path| {
                load_dependencies_wrapper(path.clone(), io.clone(), dependencies.clone())
            }),
        )
        .await;
    }
}

fn load_dependencies_wrapper<'io, TIO: IO>(
    path: String,
    io: Arc<&'io TIO>,
    dependencies: Arc<Mutex<HashMap<String, Dependency>>>,
) -> BoxFuture<'io, ()> {
    Box::pin(load_dependencies(path, io, dependencies))
}
