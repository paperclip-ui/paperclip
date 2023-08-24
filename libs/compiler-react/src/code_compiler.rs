use super::context::Context;
use anyhow::Result;
use paperclip_common::get_or_short;
use paperclip_evaluator::core::utils::get_style_namespace;
use paperclip_proto::ast::{
    graph_ext::{Dependency, Graph},
    pc as ast,
};
use std::collections::BTreeMap;

pub fn compile_code(dependency: &Dependency, graph: &Graph) -> Result<String> {
    let mut context = Context::new(&dependency, graph);
    compile_document(
        dependency.document.as_ref().expect("Document must exist"),
        &mut context,
    );
    Ok(context.get_buffer())
}

fn compile_document(document: &ast::Document, context: &mut Context) {
    compile_imports(document, context);
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                compile_component(&component, context)
            }
            _ => {}
        }
    }
}

fn compile_imports(document: &ast::Document, context: &mut Context) {
    // Temporary until things stabilize - primarily for development of the editor
    context.add_buffer(
        format!(
            "require(\"./{}.css\");\n",
            std::path::Path::new(&context.dependency.path)
                .file_name()
                .unwrap()
                .to_str()
                .unwrap()
        )
        .as_str(),
    );
    context.add_buffer("import * as React from \"react\";\n");
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Import(import) => {
                compile_import(import, context);
            }
            _ => {}
        }
    }
    context.add_buffer("\n");
}

fn compile_import(import: &ast::Import, context: &mut Context) {
    context.add_buffer(
        format!(
            "import * as {} from \"{}\";\n",
            import.namespace, import.path
        )
        .as_str(),
    );
}

macro_rules! compile_children {
    ($expr: expr, $cb: expr, $context: expr, $include_ary: expr) => {{

        if $include_ary {
            $context.add_buffer("[");
        }
        $context.add_buffer("\n");
        $context.start_block();

        let mut children = $expr.into_iter().peekable();
        while let Some(child) = children.next() {
            let printed = ($cb)(child);

            if printed {
                if !children.peek().is_none() {
                    $context.add_buffer(", ");
                }

                $context.add_buffer("\n");
            }
        }

        $context.end_block();

        if $include_ary {
            $context.add_buffer("]");
        }
    }};
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    context.add_buffer(format!("const _{} = (props, ref) => {{\n", &component.name).as_str());

    context.start_block();
    compile_component_render(component, &mut context.within_component(component));
    context.end_block();

    context.add_buffer("};\n");
    context.add_buffer(
        format!(
            "_{}.displayName = \"{}\";\n",
            component.name, component.name
        )
        .as_str(),
    );

    if component.is_public {
        context.add_buffer("export ");
    }

    context.add_buffer(
        format!(
            "const {} = React.memo(React.forwardRef(_{}));\n\n",
            component.name, component.name
        )
        .as_str(),
    );
}

fn compile_component_render(component: &ast::Component, context: &mut Context) {
    let render = get_or_short!(component.get_render_expr(), ());

    context.add_buffer("return ");
    compile_node(
        render.node.as_ref().expect("Node must exist"),
        context,
        true,
    );
    context.add_buffer(";\n");
}

fn compile_text_node(node: &ast::TextNode, context: &mut Context) {
    context.add_buffer(format!("\"{}\"", node.value).as_str());
}

fn compile_slot(node: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("props.{}", node.name).as_str());

    if node.body.len() > 0 {
        context.add_buffer(" || ");
        compile_node_children(&node.body, context, true);
    }
}
fn compile_element(element: &ast::Element, is_root: bool, context: &mut Context) {
    let is_instance = context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .contains_component_name(&element.tag_name)
        || element.namespace != None;

    let tag_name = if is_instance {
        let mut buffer = format!("{}", element.tag_name);
        if let Some(namespace) = &element.namespace {
            buffer = format!("{}.{}", namespace, buffer);
        }
        buffer
    } else {
        format!("\"{}\"", element.tag_name)
    };

    context.add_buffer(format!("React.createElement({}, ", tag_name).as_str());
    compile_element_parameters(element, is_instance, is_root, context);
    compile_element_children(element, context);
    context.add_buffer(")")
}

fn compile_element_children(element: &ast::Element, context: &mut Context) {
    let visible_children = element.get_visible_children();

    if visible_children.len() == 0 {
        return;
    }

    context.add_buffer(", ");

    compile_node_children(&element.body, context, false);
}

fn compile_node_children(children: &Vec<ast::Node>, context: &mut Context, include_ary: bool) {
    compile_children! {
      &children,
      |child: &ast::Node| {
        compile_node(child, context, false)
      },
      context,
      include_ary
    }
}

fn compile_node(node: &ast::Node, context: &mut Context, is_root: bool) -> bool {
    match node.get_inner() {
        ast::node::Inner::Text(expr) => compile_text_node(&expr, context),
        ast::node::Inner::Element(expr) => compile_element(&expr, is_root, context),
        ast::node::Inner::Slot(expr) => compile_slot(&expr, context),
        _ => return false,
    };
    return true;
}

fn compile_element_parameters(
    element: &ast::Element,
    is_instance: bool,
    is_root: bool,
    context: &mut Context,
) {
    let raw_attrs = rename_attrs_for_react(
        get_raw_element_attrs(element, is_instance, is_root, context),
        is_instance,
    );

    if raw_attrs.len() == 0 {
        context.add_buffer("null");
        return;
    }

    context.add_buffer("{\n");
    context.start_block();

    let mut attrs = raw_attrs.iter().peekable();

    while let Some((key, value)) = attrs.next() {
        context.add_buffer(format!("\"{}\": {}", key, value.get_buffer()).as_str());
        if !attrs.peek().is_none() {
            context.add_buffer(",");
        }
        context.add_buffer("\n");
    }
    context.end_block();
    context.add_buffer("}");
}

fn get_raw_element_attrs<'dependency>(
    element: &ast::Element,
    is_instance: bool,
    is_root: bool,
    context: &mut Context<'dependency>,
) -> BTreeMap<String, Context<'dependency>> {
    let mut attrs: BTreeMap<String, Context<'dependency>> = BTreeMap::new();

    for parameter in &element.parameters {
        let mut param_context = context.with_new_content();
        compile_simple_expression(
            &parameter.value.as_ref().expect("Value must exist"),
            &mut param_context,
        );
        attrs.insert(parameter.name.to_string(), param_context);
    }

    if is_instance || element.is_stylable() {
        let sub = context.with_new_content();
        sub.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&element.name, &element.id, context.current_component)
            )
            .as_str(),
        );

        if is_root {
            sub.add_buffer(
                format!(" + (props.$$scopeClassName ? \" \" + props.$$scopeClassName : \"\")")
                    .as_str(),
            );
        }

        if is_instance {
            attrs.insert("$$scopeClassName".to_string(), sub);
        } else {
            if let Some(class) = attrs.get_mut("class") {
                class.add_buffer(format!(" + \" \" + {}", sub.get_buffer()).as_str());
            } else {
                attrs.insert("class".to_string(), sub);
            }
        }
    }

    for insert in &element.get_inserts() {
        let mut sub = context.with_new_content();
        compile_insert(insert, &mut sub);
        attrs.insert(insert.name.to_string(), sub);
    }

    if is_root {
        let sub = context.with_new_content();
        sub.add_buffer("ref");
        attrs.insert("ref".to_string(), sub);
    }

    let sub = context.with_new_content();
    sub.add_buffer(format!("\"{}\"", element.id).as_str());
    attrs.insert("key".to_string(), sub);

    attrs
}

fn compile_insert(insert: &ast::Insert, context: &mut Context) {
    compile_node_children(&insert.body, context, true);
}

fn rename_attrs_for_react(
    attrs: BTreeMap<String, Context>,
    is_instance: bool,
) -> BTreeMap<String, Context> {
    if is_instance {
        return attrs;
    }
    attrs
        .into_iter()
        .map(|(key, context)| (attr_alias(key.as_str()), context))
        .collect()
}

fn attr_alias(name: &str) -> String {
    (match name {
        "class" => "className",
        _ => name,
    })
    .to_string()
}

fn compile_simple_expression(expr: &ast::SimpleExpression, context: &mut Context) {
    match expr.get_inner() {
        ast::simple_expression::Inner::Str(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Num(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::simple_expression::Inner::Bool(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::simple_expression::Inner::Ary(expr) => compile_array(expr, context),
        ast::simple_expression::Inner::Reference(expr) => compile_reference(expr, context),
    }
}

fn compile_reference(expr: &ast::Reference, context: &mut Context) {
    let mut parts = expr.path.iter().peekable();

    while let Some(part) = parts.next() {
        context.add_buffer(format!("props.{}", part).as_str());
        if !parts.peek().is_none() {
            context.add_buffer(", ");
        }
    }
}

fn compile_array(expr: &ast::Ary, context: &mut Context) {
    context.add_buffer("[");
    context.start_block();
    let mut items = expr.items.iter().peekable();
    while let Some(item) = items.next() {
        compile_simple_expression(item, context);
        if !items.peek().is_none() {
            context.add_buffer(", ");
        }
    }
    context.end_block();
    context.add_buffer("]");
}
