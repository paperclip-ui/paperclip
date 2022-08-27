use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use paperclip_parser::docco::ast as docco_ast;
use crate::core::errors;
use std::cell::RefCell;
use std::rc::Rc;
use super::context::DocumentContext;
use super::virt;

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
            },
            ast::DocumentBodyItem::Element(element) => {
                evaluate_element(element, &current_doc_comment, &mut children, context);
            },
            ast::DocumentBodyItem::DocComment(doc_comment) => {
                current_doc_comment = Some(doc_comment);
            }
            ast::DocumentBodyItem::Text(text_node) => {
                evaluate_text_node(text_node, &current_doc_comment, &mut children, context);
            },
            _ => {

            }
        }

        current_doc_comment = None;
    }

    context.document.borrow_mut().children = children;
}

fn evaluate_component(component: &ast::Component, doc_comment: &Option<&docco_ast::Comment>, siblings: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {
    
}


fn evaluate_element(element: &ast::Element, doc_comment: &Option<&docco_ast::Comment>, siblings: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {
    let mut children = vec![];

    for child in &element.body {
        match child {
            ast::ElementBodyItem::Element(child) => {
                evaluate_element(child, &None, &mut children, context)
            },
            _ => {

            }
        }
    }


    siblings.push(virt::NodeChild::Element(virt::Element {
        tag_name: element.tag_name.to_string(),
        source_id: Some(element.id.to_string()),
        attributes: create_attributes(element, context),
        children,
        metadata: None
    }));
}




fn create_attributes(element: &ast::Element, context: &DocumentContext) -> Vec<virt::Attribute> {
    let mut attributes = vec![];

    attributes
}

fn evaluate_text_node(text_node: &ast::TextNode, doc_comment: &Option<&docco_ast::Comment>, siblings: &mut Vec<virt::NodeChild>, context: &mut DocumentContext) {

}