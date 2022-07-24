use super::ast;

struct Context {
    pub is_new_line: bool,
    pub buffer: String,
    pub depth: u8,
    pub indent_size: u8,
}

impl Context {
    pub fn new() -> Context {
        Context {
            buffer: "".to_string(),
            depth: 0,
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
    pub fn add_buffer(&mut self, buffer: String) {
        let indent = if self.is_new_line {
            " ".repeat((self.depth * self.indent_size) as usize)
        } else {
            "".to_string()
        };

        self.buffer = format!("{}{}{}", indent, self.buffer, buffer);

        self.is_new_line = if let Some(pos) = buffer.rfind("\n") {
            pos == buffer.len() - 1
        } else {
            false
        };
    }
}

pub fn serialize(document: &ast::Document) -> String {
    let mut context = Context::new();
    serialize_document(document, &mut context);
    context.buffer
}

fn serialize_document(document: &ast::Document, context: &mut Context) {
    for item in &document.body {
        match item {
            ast::DocumentBodyItem::Import(imp) => serialize_import(imp, context),
            ast::DocumentBodyItem::Component(comp) => serialize_component(comp, context),
            ast::DocumentBodyItem::Style(style) => serialize_style(style, context),
        }
    }
}

fn serialize_import(imp: &ast::Import, context: &mut Context) {
    context.add_buffer(format!("import \"{}\" as {}\n", imp.path, imp.namespace));
}

fn serialize_component(component: &ast::Component, context: &mut Context) {
    context.add_buffer(format!("component {} {{\n", component.name));
    context.start_block();
    for item in &component.body {
        match item {
            ast::ComponentBodyItem::Render(render) => serialize_render(render, context),
            ast::ComponentBodyItem::Variant(variant) => serialize_variant(variant, context),
        }
    }
    context.end_block();
    context.add_buffer("}".to_string());
}

fn serialize_style(style: &ast::Style, context: &mut Context) {
    context.add_buffer(format!("style {{\n"));
    context.start_block();
    for item in &style.body {
    }
    context.end_block();
    context.add_buffer("}".to_string());
}

fn serialize_render(imp: &ast::Render, context: &mut Context) {
    context.add_buffer("render".to_string());
}

fn serialize_node(node: &ast::Node, context: &mut Context) {
    match node {
        ast::Node::Text(text) => serialize_text(text, context),
        ast::Node::Element(text) => serialize_element(text, context),
    }
}

fn serialize_text(node: &ast::TextNode, context: &mut Context) {}

fn serialize_element(node: &ast::Element, context: &mut Context) {}

fn serialize_variant(imp: &ast::Variant, context: &mut Context) {}
