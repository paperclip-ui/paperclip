pub trait FileReader {
    fn read_file<'content>(&self, path: &str) -> Option<Box<[u8]>>;
}

pub trait FileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> Option<String>;
}
