use paperclip_common::id::get_document_id;
use paperclip_common::serialize_context::Context as SerializeContext;

pub struct Context {
    pub content: SerializeContext,
    pub document_id: String,
}

impl Context {
    pub fn new(path: &str) -> Self {
        Self {
            content: SerializeContext::new(0),
            document_id: get_document_id(path),
        }
    }
    pub fn add_buffer(&mut self, buffer: &str) {
        self.content.add_buffer(buffer);
    }
    pub fn start_block(&mut self) {
        self.content.start_block();
    }
    pub fn end_block(&mut self) {
        self.content.end_block();
    }
    pub fn get_buffer(&self) -> String {
        self.content.buffer.to_string()
    }
    pub fn with_new_content(&self) -> Self {
        Self {
            content: SerializeContext::new(self.content.depth),
            document_id: self.document_id.to_string(),
        }
    }
}
