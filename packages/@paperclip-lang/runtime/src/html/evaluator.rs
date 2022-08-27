use super::context::DocumentContext;
use super::virt;
use crate::core::errors;
use crate::core::virt as core_virt;
use paperclip_parser::docco::ast as docco_ast;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::reference as graph_ref;
use paperclip_parser::pc::ast;
use std::collections::HashMap;
use std::rc::Rc;

pub async fn evaluate(
    path: &str,
    graph: &graph::Graph,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    if let Some(dependency) = dependencies.get(path) {
        let mut context = DocumentContext::new(path, graph);

        evaluate_document(&dependency.document, &mut context);

        Ok(Rc::try_unwrap(context.document).unwrap().into_inner())
    } else {
        Err(errors::RuntimeError {
            message: "not found".to_string(),
        })
    }
}

fn evaluate_document(document: &ast::Document, context: &mut DocumentContext) {
    let mut current_doc_comment: Option<&docco_ast::Comment> = None;

    let mut children = vec![];

    for item in &document.body {
        match item {
            ast::DocumentBodyItem::Component(component) => {
                evaluate_component(component, &current_doc_comment, &mut children, context);
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

    context.document.borrow_mut().children = children;
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
    let mut ref_path = vec![element.tag_name.to_string()];

    let reference = context.graph.get_ref(&ref_path, &context.path);

    if let Some(reference) = reference {
        if let graph_ref::Expr::Component(component) = &reference.expr {
            evaluate_instance(element, component, doc_comment, fragment, context);
        }
    } else {
        evaluate_native_element(element, doc_comment, fragment, context);
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

    let data = create_raw_object_from_params(element, context);

    println!("{:?}", data);

    evaluate_render(&render, doc_comment, fragment, context);
}

fn evaluate_instance_children(
    element: &ast::Element,
    context: &mut DocumentContext,
) -> HashMap<String, Vec<virt::Node>> {
    let mut inserts = HashMap::new();
    for child in &element.body {
        evaluate_instance_child(child, &mut inserts, context);
    }
    inserts
}

fn evaluate_instance_child(
    child: &ast::ElementBodyItem,
    inserts: &mut HashMap<String, Vec<virt::Node>>,
    context: &mut DocumentContext,
) {
    inserts.insert("children".to_string(), vec![]);

    match child {
        ast::ElementBodyItem::Insert(insert) => {
            let fragment = if let Some(fragment) = inserts.get_mut(&insert.name) {
                fragment
            } else {
                let fragment = vec![];
                inserts.insert(insert.name.to_string(), fragment);
                inserts.get_mut(&insert.name).unwrap()
            };

            for child in &insert.body {
                evaluate_insert_child(child, fragment, context);
            }
        }
        _ => {
            evaluate_element_child(child, inserts.get_mut("children").unwrap(), context);
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
        ast::RenderNode::Slot(slot) => {}
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
        _ => {}
    }
}

fn create_attributes(element: &ast::Element, context: &DocumentContext) -> Vec<virt::Attribute> {
    let mut attributes = vec![];

    for param in &element.parameters {
        evaluate_attribute(param, &mut attributes, context);
    }

    attributes
}

fn evaluate_attribute(
    param: &ast::Parameter,
    attributes: &mut Vec<virt::Attribute>,
    context: &DocumentContext,
) {
    attributes.push(virt::Attribute {
        source_id: Some(param.id.to_string()),
        name: param.name.to_string(),
        value: create_attribute_value(&param.value, context).to_string(),
    })
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
        fragment.push(virt::Node::TextNode(virt::TextNode {
            source_id: Some(text_node.id.to_string()),
            value: value.to_string(),
            metadata: None,
        }))
    }
}
