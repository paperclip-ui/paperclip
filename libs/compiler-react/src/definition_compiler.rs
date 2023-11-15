use std::collections::BTreeMap;

use crate::{
    context::Options,
    utils::{contains_script, COMPILER_NAME},
};

use super::context::Context;
use anyhow::Result;
use paperclip_infer::infer::Inferencer;
use paperclip_infer::types as infer_types;
use paperclip_proto::ast::{
    get_expr::GetExpr,
    graph_ext::{Dependency, Graph},
    pc as ast,
};

pub fn compile_typed_definition(dep: &Dependency, graph: &Graph) -> Result<String> {
    let mut context = Context::new(
        dep,
        graph,
        Options {
            use_exact_imports: false,
        },
    );
    compile_document(&mut context);
    Ok(context.get_buffer())
}

fn compile_document(context: &mut Context) {
    compile_imports(context);
    compile_components(context);
}

fn collect_imports(imports: &mut BTreeMap<String, String>, context: &mut Context) {
    imports.insert("react".to_string(), "React".to_string());
    collect_component_imports(imports, context);
}

fn compile_imports(context: &mut Context) {
    let mut imports = BTreeMap::new();
    collect_imports(&mut imports, context);

    for (path, namespace) in imports {
        context.add_buffer(format!("import * as {} from \"{}\";\n", namespace, path).as_str());
    }
    context.add_buffer("\n");
}

fn collect_component_imports(imports: &mut BTreeMap<String, String>, context: &mut Context) {
    for item in &context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .body
    {
        if let ast::document_body_item::Inner::Component(component) = item.get_inner() {
            if let Some(script) = component.get_script(COMPILER_NAME) {
                let src = script.get_src().expect("src must exist");
                let hash = format!("{:x}", crc::crc32::checksum_ieee(src.as_bytes())).to_string();
                imports.insert(src.to_string(), format!("_{}", hash));
            }
        }
        if let ast::document_body_item::Inner::Import(import) = item.get_inner() {
            imports.insert(import.path.to_string(), import.namespace.to_string());
        }
    }
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
        .expect("Cannot infer component");

    context.add_buffer(format!("export type Base{}Props = {{\n", component.name).as_str());
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

    if let Some(script) = component.get_script(COMPILER_NAME) {
        let hash = format!(
            "{:x}",
            crc::crc32::checksum_ieee(script.get_src().expect("src must exist").as_bytes())
        )
        .to_string();
        let name = script.get_name().unwrap_or("default".to_string());

        context.add_buffer(
            format!(
                "export const {}: ReturnType<_{}.{}>;\n",
                component.name, hash, name
            )
            .as_str(),
        );
    } else {
        context.add_buffer(
            format!(
                "export const {}: React.FC<Base{}Props>;\n",
                component.name, component.name
            )
            .as_str(),
        );
    }
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
                let el: ast::Element =
                    GetExpr::get_expr(&el.id, &context.dependency.get_document())
                        .expect("Element must exist")
                        .try_into()
                        .expect("Cannot convert into element");
                let component =
                    GetExpr::get_owner_component(&el.id, &context.dependency.get_document())
                        .expect("Inferred element must exist within component");

                if contains_script(&el.body) {
                    context.add_buffer(
                        format!("{}{}", component.name, el.name.unwrap_or(el.id.to_string()))
                            .as_str(),
                    );
                } else {
                    context.add_buffer("React.DOMAttributes<any>");
                }
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
        infer_types::Type::Enum(types) => {
            let mut peekable = types.iter().peekable();

            while let Some(arg) = peekable.next() {
                compile_inference(arg, context);
                if !matches!(peekable.peek(), None) {
                    context.add_buffer(" | ")
                }
            }
        }
        infer_types::Type::ExactString(value) => {
            context.add_buffer(format!("\"{}\"", value).as_str());
        }
        infer_types::Type::Array(value) => {
            context.add_buffer(format!("Array<").as_str());
            compile_inference(value, context);
            context.add_buffer(format!(">").as_str());
        }
        infer_types::Type::Map(map) => {
            context.add_buffer("{\n");
            context.start_block();

            for (key, value) in map {
                context.add_buffer(format!("\"{}\"", key).as_str());
                if value.optional {
                    context.add_buffer("?");
                }
                context.add_buffer(": ");
                compile_inference(&value.prop_type, context);
                context.add_buffer(",\n");
            }
            context.end_block();
            context.add_buffer("}");
        }
        _ => {}
    }
}
