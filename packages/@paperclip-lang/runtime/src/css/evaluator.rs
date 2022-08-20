use super::errors;
use super::virt;
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use paperclip_parser::css::ast as css_ast;
use std::cell::RefCell;
use std::rc::Rc;

struct DocumentContext<'graph, 'expr> {
    graph: &'graph graph::Graph,
    current_element: Option<&'expr ast::Element>,
    current_component: Option<&'expr ast::Component>,
    document: Rc<RefCell<virt::Document>>,
}

impl<'graph, 'component> DocumentContext<'graph, 'component> {
    pub fn within_component(&self, component: &'component ast::Component) -> Self {
        DocumentContext {
            graph: self.graph,
            current_element: self.current_element,
            current_component: Some(component),
            document: self.document.clone(),
        }
    }
    pub fn within_element(&self, element: &'component ast::Element) -> Self {
        DocumentContext {
            graph: self.graph,
            current_element: Some(element),
            current_component: self.current_component,
            document: self.document.clone(),
        }
    }
}

pub async fn evaluate(
    path: &str,
    graph: &graph::Graph,
) -> Result<virt::Document, errors::RuntimeError> {
    if let Some(dep) = graph.dependencies.lock().await.get(path) {
        let document = virt::Document {
            id: "aa".to_string(),
            rules: vec![],
        };

        let mut context = DocumentContext {
            graph,
            current_element: None,
            current_component: None,
            document: Rc::new(RefCell::new(document)),
        };

        evaluate_document(&dep.document, &mut context);

        Ok(Rc::try_unwrap(context.document).unwrap().into_inner())
    } else {
        Err(errors::RuntimeError {
            message: "not found".to_string(),
        })
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
        }
        ast::DocumentBodyItem::Element(component) => {
            evaluate_element(component, context);
        }
        _ => {}
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
        }
        _ => {}
    }
}

fn evaluate_element(element: &ast::Element, context: &mut DocumentContext) {
    let mut el_context = context.within_element(element);

    for item in &element.body {
        match item {
            ast::ElementBodyItem::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
            _ => {}
        }
    }
}

fn evaluate_style(style: &ast::Style, context: &mut DocumentContext) {
    if let Some(ns) = get_style_namespace(style, context) {
        context
            .document
            .borrow_mut()
            .rules
            .push(virt::Rule::Style(virt::StyleRule {
                id: "rule".to_string(),
                source_id: style.id.to_string(),
                selector_text: format!(".{}", ns),
                style: evaluate_style_declarations(style, context),
            }))
    }
}

fn get_style_namespace(style: &ast::Style, context: &DocumentContext) -> Option<String> {
    if let Some(element) = &context.current_element {
        let mut ns = format!("{}", element.id);
        if let Some(component) = &context.current_component {
            ns = format!("{}__{}", component.id, ns);
        }
        Some(ns)
    } else {
        None
    }
}

fn evaluate_style_declarations(
    style: &ast::Style,
    context: &DocumentContext,
) -> Vec<virt::StyleDeclaration> {
    let decls = vec![];
    for decl in &style.declarations {
        evaluate_style_declaration(&decl.value, context);
    }
    decls
}

fn evaluate_style_declaration(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext,
) {

}
