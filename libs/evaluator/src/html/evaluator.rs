pub use super::context::{DocumentContext, Options};
use super::virt;
use crate::core::errors;
use crate::core::utils::get_style_namespace;
use crate::core::virt as core_virt;
use paperclip_common::fs::FileResolver;
use paperclip_parser::graph;
use paperclip_parser::graph::reference as graph_ref;
use paperclip_parser::pc::ast;
use std::collections::BTreeMap;
use std::collections::HashMap;

type InsertsMap<'expr> = HashMap<String, (String, Vec<virt::Node>)>;

pub async fn evaluate<F: FileResolver>(
    path: &str,
    graph: &graph::Graph,
    file_resolver: &F,
    options: Options,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    if let Some(dependency) = dependencies.get(path) {
        let mut context = DocumentContext::new(path, graph, file_resolver, options);
        let document = evaluate_document(&dependency.document, &mut context);
        Ok(document)
    } else {
        Err(errors::RuntimeError {
            message: "not found".to_string(),
        })
    }
}

fn evaluate_document<F: FileResolver>(
    document: &ast::Document,
    context: &mut DocumentContext<F>,
) -> virt::Document {
    let mut children = vec![];

    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                if context.options.include_components {
                    evaluate_component::<F>(component, &mut children, context);
                }
            }
            ast::document_body_item::Inner::Element(element) => {
                evaluate_element::<F>(element, &mut children, context);
            }
            ast::document_body_item::Inner::DocComment(_doc_comment) => {
                // TODO
            }
            ast::document_body_item::Inner::Text(text_node) => {
                evaluate_text_node(text_node, &mut children, context);
            }
            _ => {}
        }
    }

    virt::Document {
        source_id: Some(document.id.to_string()),
        children,
    }
}

fn evaluate_component<F: FileResolver>(
    component: &ast::Component,

    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    let render = if let Some(render) = component.get_render_expr() {
        render
    } else {
        return;
    };

    evaluate_render(&render, fragment, &mut context.within_component(component));
}

fn evaluate_element<F: FileResolver>(
    element: &ast::Element,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    let mut ref_path = vec![];

    if let Some(ns) = &element.namespace {
        ref_path.push(ns.to_string());
    }

    ref_path.push(element.tag_name.to_string());

    let reference = context.graph.get_ref(&ref_path, &context.path);

    if let Some(reference) = reference {
        if let graph_ref::Expr::Component(component) = &reference.expr {
            evaluate_instance(
                element,
                component,
                fragment,
                &mut context.within_component(component),
            );
        }
    } else {
        evaluate_native_element(element, fragment, context);
    }
}

fn evaluate_slot<F: FileResolver>(
    slot: &ast::Slot,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    if let Some(data) = &context.data {
        if let Some(reference) = data.borrow_mut().get(&slot.name) {
            if let core_virt::value::Inner::Array(children) = reference.get_inner() {
                for item in &children.items {
                    match item.get_inner() {
                        core_virt::value::Inner::Node(node) => {
                            fragment.push(node.clone());
                        }
                        _ => {}
                    }
                }
            }
            return;
        }
    }

    // render default children
    for child in &slot.body {
        match child.get_inner() {
            ast::slot_body_item::Inner::Element(child) => {
                evaluate_element(child, fragment, context)
            }
            ast::slot_body_item::Inner::Text(child) => evaluate_text_node(child, fragment, context),
        }
    }
}

fn evaluate_instance<F: FileResolver>(
    element: &ast::Element,
    instance_of: &ast::Component,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    let render = if let Some(render) = instance_of.get_render_expr() {
        render
    } else {
        return;
    };

    let mut data = create_raw_object_from_params(element, context);
    add_inserts_to_data(&mut create_inserts(element, context), &mut data);

    evaluate_render(&render, fragment, &mut context.with_data(data));
}

fn add_inserts_to_data(inserts: &mut InsertsMap, data: &mut core_virt::Object) {
    for (name, (source_id, children)) in inserts.drain() {
        data.properties.push(core_virt::ObjectProperty {
            source_id: Some(source_id.to_string()),
            name: name.to_string(),
            value: Some(
                core_virt::value::Inner::Array(core_virt::Array {
                    source_id: Some(source_id.to_string()),
                    items: children
                        .iter()
                        .map(|child| core_virt::value::Inner::Node(child.clone()).get_outer())
                        .collect(),
                })
                .get_outer(),
            ),
        })
    }
}

fn create_inserts<'expr, F: FileResolver>(
    element: &'expr ast::Element,
    context: &mut DocumentContext<F>,
) -> InsertsMap<'expr> {
    let mut inserts = HashMap::new();
    inserts.insert("children".to_string(), (element.id.to_string(), vec![]));
    for child in &element.body {
        evaluate_instance_child(child, &mut inserts, context);
    }
    inserts
}

fn evaluate_instance_child<'expr, F: FileResolver>(
    child: &'expr ast::ElementBodyItem,
    inserts: &mut InsertsMap<'expr>,
    context: &mut DocumentContext<F>,
) {
    match child.get_inner() {
        ast::element_body_item::Inner::Insert(insert) => {
            let (_source_id, fragment) = if let Some(fragment) = inserts.get_mut(&insert.name) {
                fragment
            } else {
                inserts.insert(insert.name.to_string(), (insert.id.to_string(), vec![]));
                inserts.get_mut(&insert.name).unwrap()
            };

            for child in &insert.body {
                evaluate_insert_child(child, fragment, context);
            }
        }
        _ => {
            evaluate_element_child(child, &mut inserts.get_mut("children").unwrap().1, context);
        }
    }
}

fn evaluate_render<F: FileResolver>(
    render: &ast::Render,

    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    match render.node.as_ref().expect("Node must exist").get_inner() {
        ast::render_node::Inner::Element(element) => {
            evaluate_element(&element, fragment, context);
        }
        ast::render_node::Inner::Slot(slot) => {
            evaluate_slot(&slot, fragment, context);
        }
        ast::render_node::Inner::Text(text) => evaluate_text_node(&text, fragment, context),
    }
}

fn evaluate_native_element<F: FileResolver>(
    element: &ast::Element,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    let mut children = vec![];

    for child in &element.body {
        evaluate_element_child(child, &mut children, context);
    }

    fragment.push(
        virt::node::Inner::Element(virt::Element {
            tag_name: element.tag_name.to_string(),
            source_id: Some(element.id.to_string()),
            attributes: create_attributes(element, context),
            children,
            metadata: None,
        })
        .get_outer(),
    );
}

fn evaluate_element_child<F: FileResolver>(
    child: &ast::ElementBodyItem,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    match child.get_inner() {
        ast::element_body_item::Inner::Element(child) => evaluate_element(child, fragment, context),
        ast::element_body_item::Inner::Slot(slot) => {
            evaluate_slot(&slot, fragment, context);
        }
        ast::element_body_item::Inner::Text(child) => evaluate_text_node(child, fragment, context),
        _ => {}
    }
}

fn evaluate_insert_child<F: FileResolver>(
    child: &ast::InsertBody,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    match child.get_inner() {
        ast::insert_body::Inner::Element(child) => evaluate_element(child, fragment, context),
        ast::insert_body::Inner::Text(child) => evaluate_text_node(child, fragment, context),
        ast::insert_body::Inner::Slot(child) => evaluate_slot(child, fragment, context),
    }
}

fn create_attributes<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
) -> Vec<virt::Attribute> {
    let mut attributes = BTreeMap::new();

    for param in &element.parameters {
        evaluate_attribute(param, &mut attributes, context);
    }

    add_static_attribute_values(element, &mut attributes, context);

    attributes.values().cloned().collect()
}

fn evaluate_attribute<F: FileResolver>(
    param: &ast::Parameter,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext<F>,
) {
    attributes.insert(
        param.name.to_string(),
        virt::Attribute {
            source_id: Some(param.id.to_string()),
            name: param.name.to_string(),
            value: create_attribute_value(param.value.as_ref().expect("Value must exist"), context)
                .to_string(),
        },
    );
}

fn add_static_attribute_values<F: FileResolver>(
    element: &ast::Element,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext<F>,
) {
    if element.is_stylable() {
        let class_name = get_style_namespace(&element.name, &element.id, context.current_component);

        if let Some(class) = attributes.get_mut("class") {
            class.value = format!("{} {}", class_name, class.value);
        } else {
            attributes.insert(
                "class".to_string(),
                virt::Attribute {
                    source_id: None,
                    name: "class".to_string(),
                    value: class_name,
                },
            );
        }
    }
}

fn create_raw_object_from_params<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
) -> core_virt::Object {
    let mut properties = vec![];

    for param in &element.parameters {
        evaluate_object_property(param, &mut properties, context);
    }

    core_virt::Object {
        source_id: Some(element.id.to_string()),
        properties,
    }
}

fn evaluate_object_property<F: FileResolver>(
    param: &ast::Parameter,
    properties: &mut Vec<core_virt::ObjectProperty>,
    context: &DocumentContext<F>,
) {
    properties.push(core_virt::ObjectProperty {
        source_id: Some(param.id.to_string()),
        name: param.name.to_string(),
        value: Some(create_attribute_value(
            param.value.as_ref().expect("Value must exist"),
            context,
        )),
    });
}

fn create_attribute_value<F: FileResolver>(
    value: &ast::SimpleExpression,
    _context: &DocumentContext<F>,
) -> core_virt::Value {
    match value.get_inner() {
        ast::simple_expression::Inner::Str(value) => core_virt::value::Inner::Str(core_virt::Str {
            value: value.value.to_string(),
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Boolean(value) => {
            core_virt::value::Inner::Boolean(core_virt::Boolean {
                value: value.value,
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Number(value) => {
            core_virt::value::Inner::Number(core_virt::Number {
                value: value.value,
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Reference(value) => {
            core_virt::value::Inner::Undef(core_virt::Undefined {
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Array(value) => {
            core_virt::value::Inner::Array(core_virt::Array {
                items: vec![],
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
    }
}

fn evaluate_text_node<F: FileResolver>(
    text_node: &ast::TextNode,

    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    let metadata = None;

    let node = if text_node.is_stylable() {
        let class_name =
            get_style_namespace(&text_node.name, &text_node.id, context.current_component);

        virt::node::Inner::Element(virt::Element {
            tag_name: "span".to_string(),
            source_id: Some(text_node.id.to_string()),
            attributes: vec![virt::Attribute {
                source_id: None,
                name: "class".to_string(),
                value: class_name.to_string(),
            }],
            metadata,
            children: vec![virt::node::Inner::TextNode(virt::TextNode {
                source_id: Some(text_node.id.to_string()),
                value: text_node.value.to_string(),
                metadata: None,
            })
            .get_outer()],
        })
        .get_outer()
    } else {
        virt::node::Inner::TextNode(virt::TextNode {
            source_id: Some(text_node.id.to_string()),
            value: text_node.value.to_string(),
            metadata,
        })
        .get_outer()
    };

    fragment.push(node);
}
