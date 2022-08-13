use crate::config::config::Config;
use crate::pc::ast::Document;
use crate::pc::parser::parse as parse_pc;
use std::collections::HashMap;

pub trait IO {
    fn resolve(&self, from_path: &String, to_path: &String) -> String;
    fn read(&self, path: &String) -> String;
}

pub struct Dependency {
    path: String,
    imports: HashMap<String, String>,
    document: Document,
}

pub struct Graph<'io, TIO: IO> {
    dependencies: HashMap<String, Dependency>,
    io: &'io TIO,
}

impl<'io, TIO: IO> Graph<'io, TIO> {
    pub fn new(io: &'io TIO) -> Graph<'io, TIO> {
        Graph {
            dependencies: HashMap::new(),
            io,
        }
    }
    pub fn load(&mut self, path: &String) {
        if self.dependencies.contains_key(path) {
            return;
        }

        if let Ok(document) = parse_pc(self.io.read(path).as_str(), path) {
            let mut imports: HashMap<String, String> = HashMap::new();
            for import in &document.get_imports() {
                let import_path = self.io.resolve(path, &import.path);
                imports.insert(import.path.to_string(), import_path);
            }

            self.dependencies.insert(
                path.to_string(),
                Dependency {
                    path: path.to_string(),
                    imports,
                    document,
                },
            );
        }
    }
}
