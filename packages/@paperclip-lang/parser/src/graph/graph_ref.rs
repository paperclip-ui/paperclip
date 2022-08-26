use super::graph::Graph;
use crate::pc::ast;

#[derive(Debug)]
pub struct RefInfo<'expr> {
  pub path: &'expr str,
  pub expr: Expr<'expr>
}

#[derive(Debug)]
pub enum Expr<'expr> {
  Document(&'expr ast::Document),
  Import(&'expr ast::Import),
  Atom(&'expr ast::Atom),
  Style(&'expr ast::Style),
  Component(&'expr ast::Component)
}

impl Graph {
  pub fn get_ref(&self, ref_path: &Vec<String>, dep_path: &str) -> Option<RefInfo<'_>> {

    let mut curr_dep = if let Some(dep) = self.dependencies.get(dep_path) {
      dep
    } else {
      return None;
    };

    let mut expr = Expr::Document(&curr_dep.document);


    for part in ref_path {
      match expr {
        Expr::Document(doc) => {
          for child in &doc.body {

            // any way to make this more DRY? Macros???
            match child {
              ast::DocumentBodyItem::Import(import) => {
                if part == &import.namespace {
                  expr = Expr::Import(import);
                  break;
                }
              }
              ast::DocumentBodyItem::Atom(atom) => {
                if part == &atom.name {
                  expr = Expr::Atom(atom);
                  break;
                }
              }
              ast::DocumentBodyItem::Component(component) => {
                if part == &component.name {
                  expr = Expr::Component(component);
                  break;
                }
              }
              ast::DocumentBodyItem::Style(style) => {
                if let Some(name) = &style.name {
                  if name == part {
                    expr = Expr::Style(style);
                    break;
                  }
                }
              },
              _ => {}
            }
          }
        },
        _ => {

        }
      }
    }

    Some(RefInfo {
      path: &curr_dep.path,
      expr
    })
  }
}