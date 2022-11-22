use super::context::Context;
use anyhow::Result;
use paperclip_parser::graph::{Dependency, Graph};
use paperclip_infer::infer::Inferencer;
use paperclip_infer::types as infer_types;
use paperclip_parser::pc::ast;

pub fn compile_typed_definition(dep: &Dependency, graph: &Graph) -> Result<String> {
    let mut context = Context::new(dep, graph);
    compile_document(&mut context);
    Ok(context.get_buffer())
}

fn compile_document(context: &mut Context) {
    context.add_buffer("import * as React from \"react\";\n\n");
    compile_components(context);
}

fn compile_components(context: &mut Context) {
    for item in &context.dependency.document.body {
        if let ast::document_body_item::Inner::Component(component) = item.get_inner() {
            if component.is_public {
                compile_component(component, context);
            }
        }
    }
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    let component_inference =
        Inferencer::new().infer_component(component, &context.dependency.path, context.graph).unwrap();

    
    context.add_buffer(format!("export type {}Props = {{\n", component.name).as_str());
    context.start_block();
    context.add_buffer("\"ref\"?: any,\n");

    for (name, prop_type) in &component_inference.properties {
        context.add_buffer(format!("\"{}\"?: ", name).as_str());
        compile_inference(prop_type, context);
        context.add_buffer(",\n");
    }

    context.end_block();
    context.add_buffer("};\n");

    context.add_buffer(format!("export const {}: React.FC<{}Props>;\n", component.name, component.name).as_str());
}

fn compile_inference(inference: &infer_types::Type, context: &mut Context) {
    match inference {
        infer_types::Type::Slot => {
            context.add_buffer("React.Children");
        }
        infer_types::Type::String => {
            context.add_buffer("string");
        }
        infer_types::Type::Number => {
            context.add_buffer("number");
        }
        infer_types::Type::Boolean => {
            context.add_buffer("boolean");
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
        infer_types::Type::Unknown => {
            context.add_buffer("any");
        }
        _ => {}
    }
}

