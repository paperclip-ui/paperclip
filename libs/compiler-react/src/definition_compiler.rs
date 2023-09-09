use std::collections::HashMap;

use super::context::Context;
use anyhow::Result;
use paperclip_infer::infer::Inferencer;
use paperclip_infer::types as infer_types;
use paperclip_proto::ast::{
    graph_ext::{Dependency, Graph},
    pc as ast,
};

pub fn compile_typed_definition(dep: &Dependency, graph: &Graph) -> Result<String> {
    let mut context = Context::new(dep, graph);
    compile_document(&mut context);
    Ok(context.get_buffer())
}

fn compile_document(context: &mut Context) {
    context.add_buffer("import * as React from \"react\";\n");
    compile_imports(context);
    compile_components(context);
}

fn compile_imports(context: &mut Context) {
    for item in &context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .body
    {
        if let ast::document_body_item::Inner::Import(import) = item.get_inner() {
            compile_import(import, context);
        }
    }
}

fn compile_import(import: &ast::Import, context: &mut Context) {
    context.add_buffer(
        format!(
            "import * as {} from \"{}\";\n",
            import.namespace, import.path
        )
        .as_str(),
    );
    context.add_buffer("\n");
}

fn compile_components(context: &mut Context) {
    for item in &context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .body
    {
        if let ast::document_body_item::Inner::Component(component) = item.get_inner() {
            if component.is_public {
                compile_component(component, context);
            }
        }
    }
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    let component_inference = Inferencer::new()
        .infer_component(component, &context.dependency.path, context.graph)
        .unwrap();

    context.add_buffer(format!("export type {}Props = {{\n", component.name).as_str());
    context.start_block();
    context.add_buffer("\"ref\"?: any,\n");

    for (name, prop) in &component_inference.properties {
        let name = if matches!(prop.prop_type, infer_types::Type::Element(_)) {
            format!("{}Props", name)
        } else {
            name.clone()
        };

        context.add_buffer(format!("\"{}\"", name).as_str());
        if prop.optional {
            context.add_buffer("?");
        }
        context.add_buffer(": ");
        compile_inference(&prop.prop_type, context);
        context.add_buffer(",\n");
    }

    context.end_block();
    context.add_buffer("};\n");

    context.add_buffer(
        format!(
            "export const {}: React.FC<{}Props>;\n",
            component.name, component.name
        )
        .as_str(),
    );
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
        infer_types::Type::Element(el) => {
            if let Some(component) =
                el.get_instance_component(&context.dependency.path, &context.graph)
            {
                let ref_name = if let Some(ns) = &el.namespace {
                    format!("{}.{}", ns, component.name.clone()).to_string()
                } else {
                    component.name.clone()
                };

                context.add_buffer(format!("React.ComponentProps<typeof {}>", ref_name).as_str());
            } else {
                context.add_buffer("React.DOMAttributes<any>");
            }
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
