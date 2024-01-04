use super::graph_ext::{Dependency, Graph};
use super::pc;
use super::pc::{document_body_item, DocumentBodyItem};
use super::shared;
use super::{pc::Component, wrapper::ExpressionWrapper};

use super::visit::{Visitable, Visitor, VisitorResult};

pub struct GetExprResult {
    pub expr: ExpressionWrapper,
    pub path: Vec<String>,
}

#[derive(Clone)]
pub struct GetExpr {
    id: String,
    current_path: Vec<String>,
}

macro_rules! getters {
    ($(($name: ident, $expr: ty)), *) => {
        $(
            fn $name(&self, expr: &$expr) -> VisitorResult<GetExprResult, GetExpr> {

                let mut clone = self.clone();
                clone.current_path.push(expr.id.clone());

            if expr.id == self.id {
                return VisitorResult::Return(GetExprResult {
                    expr: expr.into(),
                    path: clone.current_path.clone()
                });
            }

            VisitorResult::Map(Box::new(clone))
          }
        )*
    };
}

impl<'expr> Visitor<GetExprResult> for GetExpr {
    getters! {
      (visit_element, pc::Element),
      (visit_component, pc::Component),
      (visit_trigger, pc::Trigger),
      (visit_text_node, pc::TextNode),
      (visit_render, pc::Render),
      (visit_slot, pc::Slot),
      (visit_insert, pc::Insert),
      (visit_variant, pc::Variant),
      (visit_style, pc::Style),
      (visit_reference, shared::Reference),
      (visit_atom, pc::Atom)
    }
}

impl<'expr> GetExpr {
    pub fn get_expr(id: &str, doc: &pc::Document) -> Option<GetExprResult> {
        let mut imp = GetExpr {
            id: id.to_string(),
            current_path: vec![],
        };
        doc.accept(&mut imp).into()
    }
    pub fn get_owner_component(id: &str, doc: &'expr pc::Document) -> Option<&'expr Component> {
        let mut imp = GetExpr {
            id: id.to_string(),
            current_path: vec![],
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
