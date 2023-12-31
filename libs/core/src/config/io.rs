use paperclip_common::fs::FileReader;

pub trait ConfigIO: Clone + Send + Sync + FileReader {
    fn get_all_designer_files(&self) -> Vec<String>;
}
