use super::context::Context;
use anyhow::Result;
use paperclip_common::get_or_short;
use paperclip_evaluator::core::utils::get_style_namespace;
use paperclip_infer::infer::Inferencer;
use paperclip_infer::types as infer_types;
use paperclip_proto::ast::{
    graph_ext::{Dependency, Graph},
    pc as ast,
};
use pathdiff::diff_paths;
use std::collections::BTreeMap;
use std::path::Path;

pub fn compile_code(dependency: &Dependency, graph: &Graph) -> Result<String> {
    let mut context = Context::new(&dependency, graph);
    compile_document(
        dependency.document.as_ref().expect("Document must exist"),
        &mut context,
    )?;
    Ok(context.get_buffer())
}

fn compile_document(document: &ast::Document, context: &mut Context) -> Result<()> {
    compile_auto_gen_banner(context);
    compile_imports(document, context);
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                compile_component(&component, context)?;
            }
            _ => {}
        }
    }
    Ok(())
}

fn compile_auto_gen_banner(context: &mut Context) {
    context.add_buffer("/**\n");
    context.add_buffer(" * !! This file is AUTO GENERATED by the Paperclip Yew compiler.\n");
    context.add_buffer(" */\n\n");
}

fn compile_imports(document: &ast::Document, context: &mut Context) {
    context.add_buffer("use yew::prelude::*;\n");
    context.add_buffer(
        "use yew::{function_component, Children, html, Properties, Callback, MouseEvent};\n",
    );
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
    let resolved_path = get_or_short!(context.dependency.imports.get(&import.path), ());
    let relative_path = get_or_short!(
        diff_paths(
            resolved_path,
            Path::new(&context.dependency.path).parent().unwrap()
        ),
        ()
    );
    context
        .add_buffer(format!("\n#[path = \"{}.rs\"]\n", relative_path.to_str().unwrap()).as_str());
    context.add_buffer(format!("mod {};\n", import.namespace).as_str());
}

macro_rules! compile_children {
    ($expr: expr, $cb: expr, $context: expr) => {{
        $context.add_buffer("\n");
        $context.start_block();

        let mut children = $expr.into_iter().peekable();
        while let Some(child) = children.next() {
            ($cb)(child);
            $context.add_buffer("\n");
        }
        $context.end_block();
    }};
}

fn compile_component(component: &ast::Component, context: &mut Context) -> Result<()> {

    let render_node = get_or_short!(component.get_render_expr(), Ok(()));

    compile_component_props(component, context)?;

    context.add_buffer("#[function_component]\n");

    if component.is_public {
        context.add_buffer("pub ");
    }

    context.add_buffer(
        format!(
            "fn {}(props: &{}Props) -> Html {{\n",
            component.name, component.name
        )
        .as_str(),
    );
    context.start_block();
    compile_render(
        render_node,
        &mut context.within_component(component),
    );
    context.end_block();
    context.add_buffer("}\n\n");
    Ok(())
}

fn compile_component_props(component: &ast::Component, context: &mut Context) -> Result<()> {
    let component_inference =
        Inferencer::new().infer_component(component, &context.dependency.path, context.graph)?;

    context.add_buffer("#[derive(Properties, PartialEq)]\n");
    if component.is_public {
        context.add_buffer("pub ");
    }
    context.add_buffer(format!("struct {}Props {{\n", component.name).as_str());
    context.start_block();
    context.add_buffer("pub __scope_class_name: Option<String>,\n");

    for (name, prop_type) in &component_inference.properties {
        if name == "children" && matches!(prop_type, infer_types::Type::Slot) {
            context.add_buffer("#[prop_or_default]\n");
        }

        context.add_buffer(format!("pub {}: ", name).as_str());
        compile_inference(prop_type, context);
        context.add_buffer(",\n");
    }

    context.end_block();
    context.add_buffer("}\n\n");

    Ok(())
}

fn compile_inference(inference: &infer_types::Type, context: &mut Context) {
    match inference {
        infer_types::Type::Slot => {
            context.add_buffer("Children");
        }
        infer_types::Type::String => {
            context.add_buffer("String");
        }
        infer_types::Type::Number => {
            context.add_buffer("f32");
        }
        infer_types::Type::Reference(reference) => {
            context.add_buffer(reference.path.join("::").as_str());
        }
        infer_types::Type::Callback(cb) => {
            context.add_buffer("Callback<");
            let mut peekable = cb.arguments.iter().peekable();

            while let Some(arg) = peekable.next() {
                compile_inference(arg, context);
                if !matches!(peekable.peek(), None) {
                    context.add_buffer(",")
                }
            }
            context.add_buffer(">");
        }
        _ => {}
    }
}

fn compile_render(render: &ast::Render, context: &mut Context) {
    context.add_buffer("html! {\n");
    context.start_block();
    match render.node.as_ref().expect("Node must exist").get_inner() {
        ast::node::Inner::Element(expr) => compile_element(&expr, true, context),
        ast::node::Inner::Text(expr) => compile_text_node(&expr, context),
        ast::node::Inner::Slot(expr) => compile_slot(&expr, context),
        _ => {}
    }
    context.end_block();
    context.add_buffer("}\n");
}

fn compile_element(element: &ast::Element, is_root: bool, context: &mut Context) {
    let is_instance = context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .contains_component_name(&element.tag_name)
        || element.namespace != None;

    let mut tag = element.tag_name.to_string();

    if let Some(namespace) = &element.namespace {
        tag = format!("{}::{}", namespace, tag);
    }

    context.add_buffer(format!("<{}", tag).as_str());
    compile_attributes(element, is_instance, is_root, context);

    context.add_buffer(">");
    compile_element_children(element, context);
    context.add_buffer(format!("</{}", tag).as_str());
    context.add_buffer(">\n");
}

fn compile_element_children(element: &ast::Element, context: &mut Context) {
    let visible_children = element.get_visible_children();

    if visible_children.len() == 0 {
        return;
    }

    compile_children! {
      &visible_children,
      |child: &ast::Node| {
        match child.get_inner() {
          ast::node::Inner::Text(expr) => compile_text_node(&expr, context),
          ast::node::Inner::Element(expr) => compile_element(&expr, false, context),
          ast::node::Inner::Slot(expr) => compile_slot(&expr, context),
          _ => {}
        };
      },
      context
    }
}

fn compile_attributes(
    element: &ast::Element,
    is_instance: bool,
    is_root: bool,
    context: &mut Context,
) {
    let raw_attrs = get_raw_element_attrs(element, is_instance, is_root, context);

    for (name, value) in &raw_attrs {
        context.add_buffer(format!(" {}={{{}}}", name, value.get_buffer()).as_str())
    }
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

    if element.is_stylable() {
        let mut sub = context.with_new_content();
        sub.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&element.name, &element.id, context.current_component)
            )
            .as_str(),
        );

        if is_root {
            let subsub = sub.with_new_content();

            subsub.add_buffer("if let Some(scope_class_name) = &props.__scope_class_name {\n");
            subsub.start_block();
            subsub.add_buffer(
                format!(
                    "format!(\"{{}} {{}}\", {}, scope_class_name)\n",
                    sub.get_buffer()
                )
                .as_str(),
            );
            subsub.end_block();
            subsub.add_buffer("} else {\n");
            subsub.start_block();
            subsub.add_buffer(format!("{}.to_string()\n", sub.get_buffer().as_str()).as_str());
            subsub.end_block();
            subsub.add_buffer("}");

            sub = subsub;
        }

        if is_instance {
            attrs.insert("__scope_class_name".to_string(), sub);
        } else {
            if let Some(class) = attrs.get("class") {
                let subsub = sub.with_new_content();
                subsub.add_buffer("format!(\"{} {}\", ");
                subsub.add_buffer(&class.get_buffer());
                subsub.add_buffer(", ");
                subsub.add_buffer(&sub.get_buffer());
                subsub.add_buffer(")");

                sub = subsub;
            }

            attrs.insert("class".to_string(), sub);
        }
    }

    for insert in &element.get_inserts() {
        let mut sub = context.with_new_content();
        compile_insert(insert, &mut sub);
        attrs.insert(insert.name.to_string(), sub);
    }

    attrs
}

fn compile_insert(insert: &ast::Insert, context: &mut Context) {
    compile_children! {
      &insert.body,
      |child: &ast::Node| {
        match child.get_inner() {
          ast::node::Inner::Element(expr) => compile_element(&expr,false, context),
          ast::node::Inner::Text(expr) => compile_text_node(&expr, context),
          ast::node::Inner::Slot(expr) => compile_slot(&expr, context),
          _ => {}
        }
      },
      context
    }
}

fn compile_text_node(_text: &ast::TextNode, _context: &mut Context) {}
fn compile_slot(expr: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("{{ for props.{}.iter() }}", expr.name).as_str());
}

fn compile_simple_expression(expr: &ast::SimpleExpression, context: &mut Context) {
    match expr.get_inner() {
        ast::simple_expression::Inner::Str(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Num(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Bool(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Reference(expr) => context.add_buffer(
            format!("props.{}.clone()", expr.path.get(0).expect("Path missing")).as_str(),
        ),
        _ => {}
    }
}
