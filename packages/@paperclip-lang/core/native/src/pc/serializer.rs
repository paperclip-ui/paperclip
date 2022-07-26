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
    context.add_buffer("}\n".to_string());
}

fn serialize_style(style: &ast::Style, context: &mut Context) {
    context.add_buffer(format!("style {{\n"));
    context.start_block();
    for item in &style.body {
        match item {
            ast::StyleBodyItem::Declaration(decl) => serialize_style_declaration(decl, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n".to_string());
}

fn serialize_override(style: &ast::Override, context: &mut Context) {
    context.add_buffer(format!("override {{\n"));
    context.start_block();
    for item in &style.body {
        match item {
            ast::OverrideBodyItem::Style(style) => serialize_style(style, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n".to_string());
}

fn serialize_style_declaration(style: &ast::StyleDeclaration, context: &mut Context) {
    context.add_buffer(format!("{}: {}\n", style.name, style.value));
}

fn serialize_render(imp: &ast::Render, context: &mut Context) {
    context.add_buffer("render ".to_string());
    serialize_render_node(&imp.node, context);
}

fn serialize_render_node(node: &ast::RenderNode, context: &mut Context) {
    match node {
        ast::RenderNode::Text(text) => serialize_text(text, context),
        ast::RenderNode::Slot(slot) => serialize_slot(slot, context),
        ast::RenderNode::Element(text) => serialize_element(text, context),
    }
}

fn serialize_text(node: &ast::TextNode, context: &mut Context) {
    context.add_buffer(format!("text \"{}\"", node.value));
    if node.body.len() > 0 {
        context.add_buffer(" {\n".to_string());
        context.start_block();
        for item in &node.body {
            match item {
                ast::TextNodeBodyItem::Style(style) => serialize_style(style, context),
            }
        }
        context.end_block();
        context.add_buffer("}".to_string());
    }

    context.add_buffer("\n".to_string());
}

fn serialize_element(node: &ast::Element, context: &mut Context) {
    context.add_buffer(format!("{}", node.tag_name));
    if node.parameters.len() > 0 {
        serialize_parameters(&node.parameters, context);
    }
    if node.body.len() > 0 {
        context.add_buffer(" {\n".to_string());
        context.start_block();
        for item in &node.body {
            match item {
                ast::ElementBodyItem::Element(element) => serialize_element(element, context),
                ast::ElementBodyItem::Slot(slot) => serialize_slot(slot, context),
                ast::ElementBodyItem::Insert(insert) => serialize_insert(insert, context),
                ast::ElementBodyItem::Style(style) => serialize_style(style, context),
                ast::ElementBodyItem::Override(over) => serialize_override(over, context),
                ast::ElementBodyItem::Text(text) => serialize_text(text, context),
            }
        }
        context.end_block();
        context.add_buffer("}".to_string());
    }
    context.add_buffer("\n".to_string());
}

fn serialize_parameters(parameters: &Vec<ast::Parameter>, context: &mut Context) {
    context.add_buffer("(".to_string());
    let mut it = parameters.into_iter().peekable();
    while let Some(param) = it.next() {
        serialize_parameter(param, context);
        if it.peek().is_some() {
            context.add_buffer(", ".to_string());
        }
    }

    context.add_buffer(")".to_string());
}

fn serialize_parameter(param: &ast::Parameter, context: &mut Context) {
    context.add_buffer(format!("{}: ", param.name));
    serialize_parameter_value(&param.value, context);
}

fn serialize_slot(slot: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("slot {} {{\n", slot.name));
    context.start_block();
    for item in &slot.body {
        match item {
            ast::SlotBodyItem::Element(element) => serialize_element(element, context),
            ast::SlotBodyItem::Text(text) => serialize_text(text, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n".to_string());
}

fn serialize_insert(insert: &ast::Insert, context: &mut Context) {
    context.add_buffer(format!("insert {} {{\n", insert.name));
    context.start_block();
    for item in &insert.body {
        match item {
            ast::InsertBody::Element(element) => serialize_element(element, context),
            ast::InsertBody::Text(text) => serialize_text(text, context),
        }
    }
    context.end_block();
    context.add_buffer("}\n".to_string());
}

fn serialize_parameter_value(node: &ast::ParameterValue, context: &mut Context) {
    match node {
        ast::ParameterValue::String(value) => serialize_string(value, context),
        ast::ParameterValue::Number(value) => serialize_number(value, context),
        ast::ParameterValue::Boolean(value) => serialize_boolean(value, context),
        ast::ParameterValue::Array(value) => serialize_array(value, context),
    }
}

fn serialize_string(node: &ast::Str, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", node.value));
}

fn serialize_number(node: &ast::Number, context: &mut Context) {}

fn serialize_array(node: &ast::Array, context: &mut Context) {
    context.add_buffer("[".to_string());
    serialize_items(
        &node.items,
        context,
        |item: &ast::ArrayItem, context: &mut Context| {},
    );
    context.add_buffer("]".to_string());
}

fn serialize_items<TItem, TSerializeFun>(
    items: &Vec<TItem>,
    context: &mut Context,
    serialize_item: TSerializeFun,
) where
    TSerializeFun: Fn(&TItem, &mut Context),
{
    let mut it = items.into_iter().peekable();
    while let Some(item) = it.next() {
        serialize_item(&item, context);
        if it.peek().is_some() {
            context.add_buffer(", ".to_string());
        }
    }
}

fn serialize_boolean(node: &ast::Boolean, context: &mut Context) {}

fn serialize_variant(imp: &ast::Variant, context: &mut Context) {
    context.add_buffer(format!("variant {} ", imp.name));
    serialize_parameters(&imp.parameters, context);
    context.add_buffer("\n".to_string());
}
