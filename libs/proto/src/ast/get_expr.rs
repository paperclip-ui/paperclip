use super::graph_ext::{Dependency, Graph};
use super::pc;
use super::pc::{document_body_item, DocumentBodyItem};
use super::shared;
use super::{all::ExpressionWrapper, pc::Component};

// use crate::ast::all::Visitable;
use super::all::visit::{Visitable, Visitor, VisitorResult};

// use super::all::{Visitor, VisitorResult};

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
      (visit_element, pc::Element),
      (visit_component, pc::Component),
      (visit_text_node, pc::TextNode),
      (visit_variant, pc::Variant),
      (visit_style, pc::Style),
      (visit_reference, shared::Reference),
      (visit_atom, pc::Atom)
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
    pub fn get_expr(id: &str, doc: &pc::Document) -> Option<ExpressionWrapper> {
        let mut imp = GetExpr {
            id: id.to_string(),
            reference: None,
        };
        doc.accept(&mut imp);
        imp.reference.clone()
    }
    pub fn get_owner_component(id: &str, doc: &'expr pc::Document) -> Option<&'expr Component> {
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
        ExpressionWrapper::Element(element) => element
            .get_instance_component(graph)
            .and_then(|component| Some(component.id.clone())),
        _ => None,
    }
}
