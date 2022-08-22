use super::errors;
use super::virt;
use futures::lock::MutexGuard;
use paperclip_common::id::get_document_id;
use paperclip_parser::css::ast as css_ast;
use paperclip_parser::graph::graph;
use paperclip_parser::pc::ast;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

struct DocumentContext<'path, 'graph, 'expr> {
    graph: &'graph graph::Graph,
    path: &'path str,
    current_element: Option<&'expr ast::Element>,
    current_component: Option<&'expr ast::Component>,
    document: Rc<RefCell<virt::Document>>,
}

impl<'path, 'graph, 'expr> DocumentContext<'path, 'graph, 'expr> {
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        DocumentContext {
            graph: self.graph,
            path: self.path,
            current_element: self.current_element,
            current_component: Some(component),
            document: self.document.clone(),
        }
    }
    pub fn within_element(&self, element: &'expr ast::Element) -> Self {
        DocumentContext {
            graph: self.graph,
            path: self.path,
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
    let dependencies = &graph.dependencies;

    if let Some(dependency) = dependencies.get(path) {
        let document = virt::Document {
            id: get_document_id(path),
            rules: vec![],
        };

        let mut context = DocumentContext {
            graph,
            path,
            current_element: None,
            current_component: None,
            document: Rc::new(RefCell::new(document)),
        };

        evaluate_document(&dependency.document, &mut context);

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
    if let Some(ns) = get_style_namespace(context) {
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

fn get_style_namespace(context: &DocumentContext) -> Option<String> {
    if let Some(element) = &context.current_element {
        // Here we're taking the _prefered_ name for style rules to make
        // them more readable
        if let Some(name) = &element.name {
            // element names are scoped to either the document, or components. If a
            // component is present, then use that
            let ns = if let Some(component) = &context.current_component {
                format!("{}-{}", component.name, name)
            } else {
                name.to_string()
            };

            // Keep the CSS scoped to this document.
            Some(format!("{}-{}", ns, context.document.borrow().id))
        } else {
            // No element name? Use the ID. We don't need the document ID
            // here since the element ID is unique.
            Some(format!("{}", element.id))
        }
    } else {
        None
    }
}

fn evaluate_style_declarations(
    style: &ast::Style,
    context: &DocumentContext,
) -> Vec<virt::StyleDeclaration> {
    let mut decls = vec![];

    if let Some(extends) = &style.extends {
        for reference in extends {
            // context.graph.dependencies
        }
    }

    for decl in &style.declarations {
        decls.push(evaluate_style_declaration(&decl, context));
    }
    decls
}

fn evaluate_style_declaration(
    decl: &css_ast::StyleDeclaration,
    context: &DocumentContext,
) -> virt::StyleDeclaration {
    virt::StyleDeclaration {
        id: "dec".to_string(),
        source_id: decl.id.to_string(),
        name: decl.name.to_string(),
        value: stringify_style_decl_value(&decl.value, context),
    }
}

fn stringify_style_decl_value(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext,
) -> String {
    match decl {
        css_ast::DeclarationValue::SpacedList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(" "),
        css_ast::DeclarationValue::CommaList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(", "),
        css_ast::DeclarationValue::Arithmetic(expr) => {
            format!(
                "{} {} {}",
                stringify_style_decl_value(&expr.left, context),
                expr.operator,
                stringify_style_decl_value(&expr.right, context)
            )
        }
        css_ast::DeclarationValue::FunctionCall(expr) => {
            // TODO - check for var
            format!(
                "{}({})",
                expr.name,
                stringify_style_decl_value(&expr.arguments, context)
            )
        }
        css_ast::DeclarationValue::HexColor(expr) => {
            format!("#{}", expr.value)
        }
        css_ast::DeclarationValue::Reference(expr) => expr.path.join("."),
        css_ast::DeclarationValue::Measurement(expr) => {
            format!("{}{}", expr.value, expr.unit)
        }
        css_ast::DeclarationValue::Number(expr) => {
            format!("{}", expr.value)
        }
        css_ast::DeclarationValue::String(expr) => {
            format!("\"{}\"", expr.value)
        }
    }
}
