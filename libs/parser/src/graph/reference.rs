use paperclip_proto::ast::css::FunctionCall;
use paperclip_proto::ast::pc::{component_body_item, render_node};

use super::core::Graph;
use crate::css::ast as css_ast;
use crate::pc::ast;

macro_rules! expr_info {
    ($name: ident, $expr: ident) => {
        
        #[derive(Debug, Clone)]
        pub struct $name<'expr> {
            pub path: &'expr str,
            pub expr: &'expr ast::$expr,
        }

        impl<'expr> $name<'expr> {
            pub fn wrap(&self) -> RefInfo<'expr> {
                RefInfo {
                    path: self.path,
                    expr: Expr::$expr(self.expr)
                }
            }
        }
    };
}

#[derive(Debug, Clone)]
pub struct RefInfo<'expr> {
    pub path: &'expr str,
    pub expr: Expr<'expr>,
}

#[derive(Debug, Clone)]
pub enum Expr<'expr> {
    Document(&'expr ast::Document),
    Import(&'expr ast::Import),
    Atom(&'expr ast::Atom),
    Style(&'expr ast::Style),
    Component(&'expr ast::Component),
    Element(&'expr ast::Element),
    Text(&'expr ast::TextNode),
    Trigger(&'expr ast::Trigger),
}

expr_info!(ComponentRefInfo, Component);

impl Graph {
    pub fn get_ref<'expr>(&'expr self, ref_path: &Vec<String>, dep_path: &str, scope: Option<Expr<'expr>>) -> Option<RefInfo<'expr>> {

        let mut curr_dep = if let Some(dep) = self.dependencies.get(dep_path) {
            dep
        } else {
            return None;
        };
        

        let mut expr = if let Some(expr) = scope {
            expr.clone()
        } else {
            Expr::Document(&curr_dep.document)
        };

        for part in ref_path {
            match expr {
                Expr::Document(doc) => {
                    expr = if let Some(inner_expr) = get_doc_body_expr(part, doc) {
                        inner_expr
                    } else {
                        return None;
                    }
                }
                Expr::Import(import) => {

                    let imp_dep =  curr_dep
                    .imports
                    .get(&import.path)
                    .and_then(|actual_path| self.dependencies.get(actual_path));

                    if let Some(dep) = imp_dep {
                        curr_dep = dep;
                        expr = if let Some(inner_expr) = get_doc_body_expr(part, &curr_dep.document) {
                            inner_expr
                        } else {
                            return None;
                        };
                    }
                }
                _ => {
                    if let Some(nested) = find_within(part, &expr) {
                        expr = nested
                    }
                }
            }
        }

        Some(RefInfo {
            path: &curr_dep.path,
            expr,
        })
    }

    pub fn get_var_ref(&self, expr: &FunctionCall, dep_path: &str) -> Option<&ast::Atom> {
        if expr.name == "var" {
            if let css_ast::declaration_value::Inner::Reference(reference) = &expr
                .arguments
                .as_ref()
                .expect("arguments missing")
                .get_inner()
            {
                if let Some(reference) = self.get_ref(&reference.path, dep_path, None) {
                    if let Expr::Atom(atom) = reference.expr {
                        return Some(atom);
                    }
                }
            }
        }
        return None;
    }

    pub fn get_instance_component_ref(&self, element: &ast::Element, path: &str) -> Option<ComponentRefInfo<'_>> {
       
        let mut ref_path = vec![];

        if let Some(ns) = &element.namespace {
            ref_path.push(ns.to_string());
        }

        ref_path.push(element.tag_name.to_string());

        if let Some(reference) = self.get_ref(&ref_path, path, None) {
            if let Expr::Component(component) = reference.expr {
                return Some(ComponentRefInfo { expr: component, path: reference.path });
            }
        }
        return None;
    }
}

fn find_reference<'expr>(name: &str, expr: Expr<'expr>) -> Option<Expr<'expr>> {
    match expr {
        Expr::Component(component) => {
            return if component.name == name {
                return Some(expr)
            } else {
                find_within(name, &expr)
            }
        },
        Expr::Element(element) => {
            return if element.name == Some(name.to_string()) {
                return Some(expr)
            } else {
                find_within(name, &expr)
            }
        },
        _ => {}
    }
    None
}

fn find_within<'expr>(name: &str, scope: &Expr<'expr>) -> Option<Expr<'expr>> {
    match scope {
        Expr::Component(component) => {
            component.body.iter().find_map(|item| {
                match item.get_inner() {
                    component_body_item::Inner::Render(render) => {
                        match render.node.as_ref().expect("Node must exist").get_inner() {
                            render_node::Inner::Element(element) => {
                                find_reference(name, Expr::Element(element))
                            },
                            _ => None
                        }
                    },
                    _ => None
                }
            })
        },
        _ => None
    }
}

fn get_doc_body_expr<'expr>(part: &String, doc: &'expr ast::Document) -> Option<Expr<'expr>> {

    for child in &doc.body {
        // any way to make this more DRY? Macros???
        match child.get_inner() {
            ast::document_body_item::Inner::Import(import) => {
                if part == &import.namespace {
                    return Some(Expr::Import(&import));
                }
            }
            ast::document_body_item::Inner::Atom(atom) => {
                if part == &atom.name {
                    return Some(Expr::Atom(&atom));
                }
            }
            ast::document_body_item::Inner::Component(component) => {
                if part == &component.name {
                    return Some(Expr::Component(&component));
                }
            }
            ast::document_body_item::Inner::Trigger(trigger) => {
                if part == &trigger.name {
                    return Some(Expr::Trigger(&trigger));
                }
            }
            ast::document_body_item::Inner::Style(style) => {
                if let Some(name) = &style.name {
                    if name == part {
                        return Some(Expr::Style(&style));
                    }
                }
            }
            _ => {}
        }
    }

    return None;
}
