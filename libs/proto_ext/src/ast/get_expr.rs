use paperclip_proto::ast;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use paperclip_proto::ast::pc::{document_body_item, DocumentBodyItem, Element};
use paperclip_proto::ast::{all::ExpressionWrapper, pc::Component};

use crate::ast::all::Visitable;

use super::all::{Visitor, VisitorResult};

pub struct GetExpr {
    id: String,
    reference: Option<ExpressionWrapper>,
}

macro_rules! getters {
    ($(($name: ident, $expr: ty)), *) => {
        $(
          fn $name(&mut self, expr: &$expr) -> VisitorResult<()> {
            if expr.id == self.id {
                self.reference = Some(expr.into());
                return VisitorResult::Return(());
            }
            VisitorResult::Continue
          }
        )*
    };
}

impl<'expr> Visitor<()> for GetExpr {
    getters! {
      (visit_element, ast::pc::Element),
      (visit_component, ast::pc::Component),
      (visit_text_node, ast::pc::TextNode),
      (visit_variant, ast::pc::Variant),
      (visit_style, ast::pc::Style),
      (visit_atom, ast::pc::Atom)
    }
}

impl<'expr> GetExpr {
    pub fn get_expr_from_graph<'graph>(
        id: &str,
        graph: &'graph Graph,
    ) -> Option<(ExpressionWrapper, &'graph Dependency)> {
        for (_path, dep) in &graph.dependencies {
            if let Some(document) = &dep.document {
                if let Some(reference) = GetExpr::get_expr(id, document) {
                    return Some((reference.clone(), &dep));
                }
            }
        }

        None
    }
    pub fn get_expr(id: &str, doc: &ast::pc::Document) -> Option<ExpressionWrapper> {
        let mut imp = GetExpr {
            id: id.to_string(),
            reference: None,
        };
        doc.accept(&mut imp);
        imp.reference.clone()
    }
    pub fn get_owner_component(
        id: &str,
        doc: &'expr ast::pc::Document,
    ) -> Option<&'expr Component> {
        let mut imp = GetExpr {
            id: id.to_string(),
            reference: None,
        };

        let mut found: Option<&DocumentBodyItem> = None;
        for item in &doc.body {
            if matches!(item.accept(&mut imp), VisitorResult::Return(_)) {
                found = Some(item);
                break;
            }
        }

        found.and_then(|item| {
            if let document_body_item::Inner::Component(component) = item.get_inner() {
                Some(component)
            } else {
                None
            }
        })
    }
}

pub fn get_expr(id: &str, dep: &Dependency) -> Option<ExpressionWrapper> {
    GetExpr::get_expr(id, &dep.document.as_ref().expect("Document must exist"))
}

pub fn get_expr_dep<'a>(id: &str, graph: &'a Graph) -> Option<(ExpressionWrapper, &'a Dependency)> {
    for (_path, dep) in &graph.dependencies {
        if let Some(expr) = get_expr(id, dep) {
            return Some((expr, dep));
        }
    }
    return None;
}

pub fn get_ref_id(expr: ExpressionWrapper, graph: &Graph) -> Option<String> {
    match &expr {
        ExpressionWrapper::Element(element) => get_element_origin_dep(element, graph)
            .document
            .as_ref()
            .unwrap()
            .get_components()
            .iter()
            .find_map(|component| {
                if &component.name == &element.tag_name {
                    Some(component.id.to_string())
                } else {
                    None
                }
            }),
        _ => None,
    }
}

fn get_element_origin_dep<'a>(element: &Element, graph: &'a Graph) -> &'a Dependency {
    let dep = get_expr_dep(&element.id, graph).unwrap().1;

    if let Some(namespace) = &element.namespace {
        if let Some(imp) = dep
            .document
            .as_ref()
            .unwrap()
            .get_imports()
            .iter()
            .find(|imp| &imp.namespace == namespace)
        {
            let imp_path = dep.imports.get(&imp.path).unwrap();
            return graph.dependencies.get(imp_path).as_ref().unwrap();
        }
    }

    dep
}
