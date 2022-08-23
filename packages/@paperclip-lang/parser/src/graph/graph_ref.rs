use super::graph::Graph;
use crate::pc::ast;

pub enum Ref<'expr> {
  Document(&'expr ast::Document),
  Import(&'expr ast::Import),
  Atom(&'expr ast::Atom),
  Style(&'expr ast::Style),
  Component(&'expr ast::Component)
}

impl Graph {
  pub fn get_ref(&self, ref_path: &Vec<&str>, dep_path: &str) -> Option<Ref<'_>> {

    let mut curr_dep = if let Some(dep) = self.dependencies.get(dep_path) {
      dep
    } else {
      return None;
    };

    let mut curr = Ref::Document(&curr_dep.document);


    for part in ref_path {
      match curr {
        Ref::Document(doc) => {
          for child in &doc.body {

            // any way to make this more DRY? Macros???
            match child {
              ast::DocumentBodyItem::Import(import) => {
                if part == &import.namespace {
                  println!("OK");
                  curr = Ref::Import(import);
                  break;
                }
              }
              ast::DocumentBodyItem::Atom(atom) => {
                if part == &atom.name {
                  curr = Ref::Atom(atom);
                  break;
                }
              }
              ast::DocumentBodyItem::Component(component) => {
                if part == &component.name {
                  curr = Ref::Component(component);
                  break;
                }
              }
              ast::DocumentBodyItem::Style(style) => {
                if let Some(name) = &style.name {
                  if name == part {
                    curr = Ref::Style(style);
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

    Some(curr)
  }
}