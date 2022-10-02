use paperclip_proto::ast::css::FunctionCall;

use super::core::Graph;
use crate::css::ast as css_ast;
use crate::pc::ast;

#[derive(Debug)]
pub struct RefInfo<'expr> {
    pub path: &'expr str,
    pub expr: Expr<'expr>,
}

#[derive(Debug)]
pub enum Expr<'expr> {
    Document(&'expr ast::Document),
    Import(&'expr ast::Import),
    Atom(&'expr ast::Atom),
    Style(&'expr ast::Style),
    Component(&'expr ast::Component),
    Trigger(&'expr ast::Trigger),
}

impl Graph {
    pub fn get_ref(&self, ref_path: &Vec<String>, dep_path: &str) -> Option<RefInfo<'_>> {


        let curr_dep = if let Some(dep) = self.dependencies.get(dep_path) {
            dep
        } else {
            return None;
        };

        let mut expr = Expr::Document(&curr_dep.document);

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
                    let body_expr = curr_dep
                        .imports
                        .get(&import.path)
                        .and_then(|actual_path| self.dependencies.get(actual_path))
                        .and_then(|imported_dep| get_doc_body_expr(part, &imported_dep.document));
                    expr = if let Some(inner_expr) = body_expr {
                        inner_expr
                    } else {
                        return None;
                    };
                }
                _ => {}
            }
        }

        Some(RefInfo {
            path: &curr_dep.path,
            expr,
        })
    }

    pub fn get_var_reference(&self, expr: &FunctionCall, dep_path: &str) -> Option<&ast::Atom> {
        if expr.name == "var" {
            if let css_ast::declaration_value::Inner::Reference(reference) = &expr
                .arguments
                .as_ref()
                .expect("arguments missing")
                .get_inner()
            {
                if let Some(reference) = self.get_ref(&reference.path, dep_path) {
                    if let Expr::Atom(atom) = reference.expr {
                        return Some(atom);
                    }
                }
            }
        }
        return None;
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
