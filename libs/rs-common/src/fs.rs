use anyhow::Result;

pub trait FileReader {
    fn read_file<'content>(&self, path: &str) -> Result<Box<[u8]>>;
}

pub trait FileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String>;
}
