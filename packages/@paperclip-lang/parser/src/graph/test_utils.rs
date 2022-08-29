use super::io::IO;
use futures::future::{BoxFuture, FutureExt};
use std::collections::HashMap;
use std::sync::Arc;

pub struct MockFS<'kv> {
    pub files: Arc<HashMap<&'kv str, &'kv str>>,
}

impl<'kv> MockFS<'kv> {
    pub fn new(files: HashMap<&'kv str, &'kv str>) -> Self {
        Self {
            files: Arc::new(files),
        }
    }
}

impl<'kv> IO for MockFS<'kv> {
    fn resolve(&self, _from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>> {
        let content = Some(to_path.to_string());

        async { content }.boxed()
    }
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>> {
        let content = if let Some(content) = self.files.get(path.as_str()) {
            Some(content.to_string())
        } else {
            None
        };

        async { content }.boxed()
    }
}
