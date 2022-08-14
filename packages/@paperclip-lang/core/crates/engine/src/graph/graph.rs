use crate::config::config::Config;
use crate::pc::ast::Document;
use crate::pc::parser::parse as parse_pc;
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
    path: String,
    imports: HashMap<String, String>,
    document: Document,
}

#[derive(Debug)]
pub struct Graph<'io, TIO: IO> {
    pub dependencies: Arc<Mutex<HashMap<String, Dependency>>>,
    io: &'io TIO,
}

impl<'io, TIO: IO> Graph<'io, TIO> {
    pub fn new(io: &'io TIO) -> Self {
        Graph {
            dependencies: Arc::new(Mutex::new(HashMap::new())),
            io,
        }
    }
    pub async fn load(&mut self, path: &String) {
        load_dependencies::<TIO>(path.clone(), Arc::new(&self.io), self.dependencies.clone()).await;
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
                        path: path.to_string(),
                        imports: imports.clone(),
                        document,
                    },
                );
            }
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

fn test(i: u32, map: Arc<Mutex<HashMap<String, String>>>) -> BoxFuture<'static, ()> {
    async move {
        let nested = map.clone();

        let mut map2 = map.lock().await;
        map2.insert("a".to_string(), i.to_string());

        if i > 0 {
            test(i - 1, nested).await;
        }
    }
    .boxed()
}
