use super::context::DocumentContext;
use super::virt;
use crate::core::errors;
use paperclip_parser::docco::ast as docco_ast;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::reference as graph_ref;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
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
    fragment: &mut Vec<virt::NodeChild>,
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
    fragment: &mut Vec<virt::NodeChild>,
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

fn evaluate_instance(element: &ast::Element, instance_of: &ast::Component, doc_comment: &Option<&docco_ast::Comment>, fragment: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {
    let render = if let Some(render) = instance_of.get_render_expr() {
        render
    } else {
        return;
    };

    evaluate_render(&render, doc_comment, fragment, context);
}

fn evaluate_render(render: &ast::Render, doc_comment: &Option<&docco_ast::Comment>, fragment: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {

    match &render.node {
        ast::RenderNode::Element(element) => {
            evaluate_element(&element, doc_comment, fragment, context);
        }
        ast::RenderNode::Slot(slot) => {}
        ast::RenderNode::Text(text) => evaluate_text_node(&text, doc_comment, fragment, context),
    }
}

fn evaluate_native_element(element: &ast::Element, doc_comment: &Option<&docco_ast::Comment>, fragment: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {

    let mut children = vec![];

    for child in &element.body {
        match child {
            ast::ElementBodyItem::Element(child) => {
                evaluate_element(child, &None, &mut children, context)
            }
            ast::ElementBodyItem::Text(child) => {
                evaluate_text_node(child, &None, &mut children, context)
            }
            _ => {}
        }
    }

    fragment.push(virt::NodeChild::Element(virt::Element {
        tag_name: element.tag_name.to_string(),
        source_id: Some(element.id.to_string()),
        attributes: create_attributes(element, context),
        children,
        metadata: None,
    }));
}

fn create_attributes(element: &ast::Element, context: &DocumentContext) -> Vec<virt::Attribute> {
    let mut attributes = vec![];

    for param in &element.parameters {
        evaluate_parameter(param, &mut attributes, context);
    }

    attributes
}

fn evaluate_parameter(
    param: &ast::Parameter,
    attributes: &mut Vec<virt::Attribute>,
    context: &DocumentContext,
) {
    attributes.push(virt::Attribute {
        source_id: Some(param.id.to_string()),
        name: param.name.to_string(),
        value: create_attribute_value(&param.value, context),
    })
}

fn create_attribute_value(value: &ast::SimpleExpression, context: &DocumentContext) -> String {
    match value {
        ast::SimpleExpression::String(value) => value.value.to_string(),
        ast::SimpleExpression::Boolean(value) => value.value.to_string(),
        ast::SimpleExpression::Number(value) => value.value.to_string(),
        ast::SimpleExpression::Reference(_) => "".to_string(),
        ast::SimpleExpression::Array(_) => "".to_string(),
    }
}

fn evaluate_text_node(
    text_node: &ast::TextNode,
    doc_comment: &Option<&docco_ast::Comment>,
    fragment: &mut Vec<virt::NodeChild>,
    context: &mut DocumentContext,
) {
    if let Some(value) = &text_node.value {
        fragment.push(virt::NodeChild::TextNode(virt::TextNode {
            source_id: Some(text_node.id.to_string()),
            value: value.to_string(),
            metadata: None,
        }))
    }
}
