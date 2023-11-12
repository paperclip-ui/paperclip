use super::io::IO;
use anyhow::Result;
use async_trait::async_trait;
use crc::crc32;
use futures::future::BoxFuture;
use futures::lock::Mutex;
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use paperclip_proto::ast::pc::Document;
use std::collections::HashMap;
use std::str;
use std::sync::Arc;

fn dep_hashes(graph: &Graph, omit: &Vec<String>) -> Arc<Mutex<HashMap<String, String>>> {
    Arc::new(Mutex::new(HashMap::from_iter(
        graph
            .dependencies
            .iter()
            .filter(|(path, _)| !omit.contains(path))
            .map(|(path, dep)| (path.to_string(), dep.hash.to_string())),
    )))
}

#[async_trait]
pub trait LoadableGraph {
    async fn load<TIO: IO>(&mut self, path: &str, io: &TIO, options: Options) -> Result<()>;
    async fn load_files<TIO: IO>(
        &mut self,
        paths: &Vec<String>,
        io: &TIO,
        options: Options,
    ) -> Result<()>;
    async fn load_into_partial<TIO: IO>(
        &self,
        paths: &Vec<String>,
        io: &TIO,
        options: Options,
    ) -> Result<Graph>;

    async fn load_file<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
        options: Options,
    ) -> Result<HashMap<String, &Dependency>>;

    async fn load_file2<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
        loaded: Arc<Mutex<HashMap<String, String>>>,
        options: Options,
    ) -> Result<HashMap<String, &Dependency>>;
}

#[async_trait]
impl LoadableGraph for Graph {
    async fn load<TIO: IO>(&mut self, path: &str, io: &TIO, options: Options) -> Result<()> {
        self.dependencies.extend(
            load_dependencies::<TIO>(
                String::from(path),
                io,
                Arc::new(Mutex::new(HashMap::new())),
                options,
            )
            .await?,
        );
        Ok(())
    }

    async fn load_files<TIO: IO>(
        &mut self,
        paths: &Vec<String>,
        io: &TIO,
        options: Options,
    ) -> Result<()> {
        let loaded = dep_hashes(&self, paths);
        for path in paths {
            self.load_file2(&path, io, loaded.clone(), options.clone())
                .await?;
        }
        Ok(())
    }

    async fn load_into_partial<TIO: IO>(
        &self,
        paths: &Vec<String>,
        io: &TIO,
        options: Options,
    ) -> Result<Graph> {
        let mut other = Graph::new();
        let loaded = dep_hashes(&self, paths);
        for path in paths {
            other
                .load_file2(&path, io, loaded.clone(), options.clone())
                .await?;
        }
        Ok(other)
    }

    async fn load_file<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
        options: Options,
    ) -> Result<HashMap<String, &Dependency>> {
        self.load_file2(path, io, dep_hashes(self, &vec![]), options)
            .await
    }

    async fn load_file2<TIO: IO>(
        &mut self,
        path: &str,
        io: &TIO,
        loaded: Arc<Mutex<HashMap<String, String>>>,
        options: Options,
    ) -> Result<HashMap<String, &Dependency>> {
        let new_dependencies =
            load_dependencies_wrapper::<TIO>(path.to_string(), io, loaded, options).await?;

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

pub fn get_document_imports<TIO: IO>(
    document: &Document,
    document_path: &str,
    io: &TIO,
) -> Result<HashMap<String, String>> {
    let mut imports = HashMap::new();

    for import in &document.get_imports() {
        imports.insert(
            import.path.to_string(),
            io.resolve_file(document_path, &import.path)?,
        );
    }

    Ok(imports)
}

/**
 * Asynchronously loads
 */

async fn load_dependencies<'io, TIO: IO>(
    path: String,
    io: &TIO,
    loaded: Arc<Mutex<HashMap<String, String>>>,
    options: Options,
) -> Result<HashMap<String, Dependency>> {
    let mut deps = HashMap::new();

    let content = str::from_utf8(&*io.read_file(&path)?).unwrap().to_string();
    let hash = format!("{:x}", crc32::checksum_ieee(content.as_bytes())).to_string();

    if loaded.lock().await.get(&path) == Some(&hash) {
        return Ok(deps);
    }

    loaded
        .lock()
        .await
        .insert(path.to_string(), hash.to_string());

    let document = if let Ok(document) = parse_pc(content.as_str(), &path, &options) {
        document
    } else {
        // TODO: this needs to be bubbled
        println!("Failed to parse {}", path);
        return Ok(deps);
    };

    let imports = get_document_imports(&document, &path, io)?;

    deps.insert(
        path.to_string(),
        Dependency {
            hash,
            path: path.to_string(),
            imports: imports.clone(),
            document: Some(document),
        },
    );

    if imports.len() > 0 {
        for path in imports.values() {
            deps.extend(
                load_dependencies_wrapper(path.clone(), io, loaded.clone(), options.clone())
                    .await?,
            );
        }
    }

    return Ok(deps);
}

fn load_dependencies_wrapper<'io, TIO: IO>(
    path: String,
    io: &'io TIO,
    loaded: Arc<Mutex<HashMap<String, String>>>,
    options: Options,
) -> BoxFuture<'io, Result<HashMap<String, Dependency>>> {
    Box::pin(load_dependencies(path, io, loaded, options))
}
