use super::virt;
use anyhow::Result;
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;

struct DocumentContext<'document, 'component> {
    current_element: Option<&'component ast::Element>,
    current_component: Option<&'component ast::Component>,
    document: &'document virt::Document
}

impl<'document, 'component> DocumentContext<'document, 'component> {
    pub fn within_component(&self, component: &'component ast::Component) -> Self {
        DocumentContext {
            current_element: self.current_element,
            current_component: Some(component),
            document: self.document
        }
    }
    pub fn within_element(&self, component: &'component ast::Component) -> Self {
        DocumentContext {
            current_element: self.current_element,
            current_component: Some(component),
            document: self.document
        }
    }
}

pub async fn evaluate(path: &str, graph: &graph::Graph) {
    if let Some(dep) = graph.dependencies.lock().await.get(path) {
        let document = virt::Document {
            id: "aa".to_string(),
            rules: vec![]
        };

        let mut context = DocumentContext { 
            current_element: None,
            current_component: None,
            document: &document
        };
    
        evaluate_document(&dep.document, &mut context);
    }
}

fn evaluate_document(document: &ast::Document, context: &mut DocumentContext) {
    for item in &document.body {
        evaluate_document_body_item(item, context);
    }
}

fn evaluate_document_body_item(item: &ast::DocumentBodyItem, context: &mut DocumentContext) {
    match item {
        ast::DocumentBodyItem::Component(component) => {
            evaluate_component(component, context);
        },
        _ => {

        }
    }
}


fn evaluate_component(component: &ast::Component, context: &mut DocumentContext) {
    for item in &component.body {
        if let ast::ComponentBodyItem::Render(render) = item {
            evaluate_render_node(&render.node, &mut context.within_component(component));
        }
    }
}

fn evaluate_render_node(node: &ast::RenderNode, context: &mut DocumentContext) {
    match node {
        ast::RenderNode::Element(element) => {
            evaluate_element(element, context);
        },
        _ => {

        }
    }
}

fn evaluate_element(element: &ast::Element, context: &mut DocumentContext) {

}