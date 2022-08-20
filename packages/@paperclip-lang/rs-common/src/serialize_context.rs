pub struct Context {
    pub is_new_line: bool,
    pub buffer: String,
    pub depth: u8,
    pub indent_size: u8,
}

impl Context {
    pub fn new(depth: u8) -> Context {
        Context {
            buffer: "".to_string(),
            depth,
            is_new_line: false,
            indent_size: 2,
        }
    }
    pub fn start_block(&mut self) {
        self.depth += 1;
    }
    pub fn end_block(&mut self) {
        self.depth -= 1;
    }
    pub fn add_buffer(&mut self, buffer: &str) {
        let indent = if self.is_new_line {
            "  ".repeat((self.depth * self.indent_size) as usize)
        } else {
            "".to_string()
        };

        self.buffer = format!("{}{}{}", self.buffer, indent, buffer);

        self.is_new_line = if let Some(pos) = buffer.rfind("\n") {
            pos == buffer.len() - 1
        } else {
            false
        };
    }
}
