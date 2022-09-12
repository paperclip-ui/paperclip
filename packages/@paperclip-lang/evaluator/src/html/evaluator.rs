pub use super::context::{DocumentContext, Options};
use super::virt;
use crate::base::types::AssetResolver;
use crate::core::errors;
use crate::core::utils::get_style_namespace;
use crate::core::virt as core_virt;
use paperclip_common::id::get_document_id;
use paperclip_parser::docco::ast as docco_ast;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::reference as graph_ref;
use paperclip_parser::pc::ast;
use std::collections::BTreeMap;
use std::collections::HashMap;
use std::rc::Rc;

type InsertsMap<'expr> = HashMap<String, (String, Vec<virt::Node>)>;

macro_rules! body_contains {
    ($expr: expr, $pat: pat) => {
        $expr.iter().find(|child| matches!(child, $pat)) != None
    };
}

pub async fn evaluate(
    path: &str,
    graph: &graph::Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
    options: Options,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    if let Some(dependency) = dependencies.get(path) {
        let mut context = DocumentContext::new(path, graph, resolve_asset, options);
        let document = evaluate_document(&dependency.document, &mut context);
        Ok(document)
    } else {
        Err(errors::RuntimeError {
            message: "not found".to_string(),
        })
    }
}

fn evaluate_document(document: &ast::Document, context: &mut DocumentContext) -> virt::Document {
    let mut current_doc_comment: Option<&docco_ast::Comment> = None;

    let mut children = vec![];

    for item in &document.body {
        match item {
            ast::DocumentBodyItem::Component(component) => {
                if context.options.include_components {
                    evaluate_component(component, &current_doc_comment, &mut children, context);
                }
            }
            ast::DocumentBodyItem::Element(element) => {
                evaluate_element(element, &current_doc_comment, &mut children, context);
            }
            ast::DocumentBodyItem::DocComment(doc_comment) => {
                current_doc_comment = Some(doc_comment);
            }
            ast::DocumentBodyItem::Text(text_node) => {
                evaluate_text_node(text_node, &current_doc_comment, &mut children, context);
            }
            _ => {}
        }

        current_doc_comment = None;
    }

    virt::Document {
        source_id: Some(document.id.to_string()),
        children,
    }
}

fn evaluate_component(
    component: &ast::Component,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    let render = if let Some(render) = component.get_render_expr() {
        render
    } else {
        return;
    };

    evaluate_render(&render, doc_comment, fragment, context);
}

fn evaluate_element(
    element: &ast::Element,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
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
                doc_comment,
                fragment,
                &mut context.within_component(component),
            );
        }
    } else {
        evaluate_native_element(element, doc_comment, fragment, context);
    }
}

fn evaluate_slot(
    slot: &ast::Slot,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    if let Some(data) = &context.data {
        if let Some(reference) = data.borrow_mut().get(&slot.name) {
            if let core_virt::Value::Array(children) = reference {
                for item in &children.items {
                    match item {
                        core_virt::Value::Node(node) => {
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
        match child {
            ast::SlotBodyItem::Element(child) => evaluate_element(child, &None, fragment, context),
            ast::SlotBodyItem::Text(child) => evaluate_text_node(child, &None, fragment, context),
        }
    }
}

fn evaluate_instance(
    element: &ast::Element,
    instance_of: &ast::Component,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    let render = if let Some(render) = instance_of.get_render_expr() {
        render
    } else {
        return;
    };

    let mut data = create_raw_object_from_params(element, context);
    add_inserts_to_data(&mut create_inserts(element, context), &mut data);

    evaluate_render(&render, doc_comment, fragment, &mut context.with_data(data));
}

fn add_inserts_to_data(inserts: &mut InsertsMap, data: &mut core_virt::Object) {
    for (name, (source_id, children)) in inserts.drain() {
        data.properties.push(core_virt::ObjectProperty {
            source_id: Some(source_id.to_string()),
            name: name.to_string(),
            value: core_virt::Value::Array(core_virt::Array {
                source_id: Some(source_id.to_string()),
                items: children
                    .iter()
                    .map(|child| core_virt::Value::Node(child.clone()))
                    .collect(),
            }),
        })
    }
}

fn create_inserts<'expr>(
    element: &'expr ast::Element,
    context: &mut DocumentContext,
) -> InsertsMap<'expr> {
    let mut inserts = HashMap::new();
    inserts.insert("children".to_string(), (element.id.to_string(), vec![]));
    for child in &element.body {
        evaluate_instance_child(child, &mut inserts, context);
    }
    inserts
}

fn evaluate_instance_child<'expr>(
    child: &'expr ast::ElementBodyItem,
    inserts: &mut InsertsMap<'expr>,
    context: &mut DocumentContext,
) {
    match child {
        ast::ElementBodyItem::Insert(insert) => {
            let (source_id, fragment) = if let Some(fragment) = inserts.get_mut(&insert.name) {
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

fn evaluate_render(
    render: &ast::Render,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    match &render.node {
        ast::RenderNode::Element(element) => {
            evaluate_element(&element, doc_comment, fragment, context);
        }
        ast::RenderNode::Slot(slot) => {
            evaluate_slot(&slot, doc_comment, fragment, context);
        }
        ast::RenderNode::Text(text) => evaluate_text_node(&text, doc_comment, fragment, context),
    }
}

fn evaluate_native_element(
    element: &ast::Element,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    let mut children = vec![];

    for child in &element.body {
        evaluate_element_child(child, &mut children, context);
    }

    fragment.push(virt::Node::Element(virt::Element {
        tag_name: element.tag_name.to_string(),
        source_id: Some(element.id.to_string()),
        attributes: create_attributes(element, context),
        children,
        metadata: None,
    }));
}

fn evaluate_element_child(
    child: &ast::ElementBodyItem,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    match child {
        ast::ElementBodyItem::Element(child) => evaluate_element(child, &None, fragment, context),
        ast::ElementBodyItem::Slot(slot) => {
            evaluate_slot(&slot, &None, fragment, context);
        }
        ast::ElementBodyItem::Text(child) => evaluate_text_node(child, &None, fragment, context),
        _ => {}
    }
}

fn evaluate_insert_child(
    child: &ast::InsertBody,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    match child {
        ast::InsertBody::Element(child) => evaluate_element(child, &None, fragment, context),
        ast::InsertBody::Text(child) => evaluate_text_node(child, &None, fragment, context),
        ast::InsertBody::Slot(child) => evaluate_slot(child, &None, fragment, context),
    }
}

fn create_attributes(element: &ast::Element, context: &DocumentContext) -> Vec<virt::Attribute> {
    let mut attributes = BTreeMap::new();

    for param in &element.parameters {
        evaluate_attribute(param, &mut attributes, context);
    }

    add_static_attribute_values(element, &mut attributes, context);

    attributes.values().cloned().collect()
}

fn evaluate_attribute(
    param: &ast::Parameter,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext,
) {
    attributes.insert(
        param.name.to_string(),
        virt::Attribute {
            source_id: Some(param.id.to_string()),
            name: param.name.to_string(),
            value: create_attribute_value(&param.value, context).to_string(),
        },
    );
}

fn add_static_attribute_values(
    element: &ast::Element,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext,
) {
    if is_stylable_element(element) {
        let class_name = get_style_namespace(
            &element.name,
            &element.id,
            &get_document_id(context.path),
            context.current_component,
        );

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

fn is_stylable_element(element: &ast::Element) -> bool {
    element.name != None || body_contains!(&element.body, ast::ElementBodyItem::Style(_))
}

fn is_stylable_text(text: &ast::TextNode) -> bool {
    body_contains!(&text.body, ast::TextNodeBodyItem::Style(_))
}

fn create_raw_object_from_params(
    element: &ast::Element,
    context: &DocumentContext,
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

fn evaluate_object_property(
    param: &ast::Parameter,
    properties: &mut Vec<core_virt::ObjectProperty>,
    context: &DocumentContext,
) {
    properties.push(core_virt::ObjectProperty {
        source_id: Some(param.id.to_string()),
        name: param.name.to_string(),
        value: create_attribute_value(&param.value, context),
    });
}

fn create_attribute_value(
    value: &ast::SimpleExpression,
    context: &DocumentContext,
) -> core_virt::Value {
    match value {
        ast::SimpleExpression::String(value) => core_virt::Value::String(core_virt::Str {
            value: value.value.to_string(),
            source_id: Some(value.id.to_string()),
        }),
        ast::SimpleExpression::Boolean(value) => core_virt::Value::Boolean(core_virt::Boolean {
            value: value.value,
            source_id: Some(value.id.to_string()),
        }),
        ast::SimpleExpression::Number(value) => core_virt::Value::Number(core_virt::Number {
            value: value.value.parse().unwrap(),
            source_id: Some(value.id.to_string()),
        }),
        ast::SimpleExpression::Reference(value) => {
            core_virt::Value::Undefined(core_virt::Undefined {
                source_id: Some(value.id.to_string()),
            })
        }
        ast::SimpleExpression::Array(value) => core_virt::Value::Array(core_virt::Array {
            items: vec![],
            source_id: Some(value.id.to_string()),
        }),
    }
}

fn evaluate_text_node(
    text_node: &ast::TextNode,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext,
) {
    if let Some(value) = &text_node.value {
        let metadata = None;

        let node = if is_stylable_text(text_node) {
            let class_name = get_style_namespace(
                &text_node.name,
                &text_node.id,
                &get_document_id(context.path),
                context.current_component,
            );

            virt::Node::Element(virt::Element {
                tag_name: "span".to_string(),
                source_id: Some(text_node.id.to_string()),
                attributes: vec![virt::Attribute {
                    source_id: None,
                    name: "class".to_string(),
                    value: class_name.to_string(),
                }],
                metadata,
                children: vec![virt::Node::TextNode(virt::TextNode {
                    source_id: Some(text_node.id.to_string()),
                    value: value.to_string(),
                    metadata: None,
                })],
            })
        } else {
            virt::Node::TextNode(virt::TextNode {
                source_id: Some(text_node.id.to_string()),
                value: value.to_string(),
                metadata,
            })
        };

        fragment.push(node);
    }
}
