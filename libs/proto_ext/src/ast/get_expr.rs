use paperclip_proto::ast;
use paperclip_proto::ast::pc::{document_body_item, DocumentBodyItem};
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
      (visit_text_node, ast::pc::TextNode),
      (visit_variant, ast::pc::Variant)
    }
}

impl<'expr> GetExpr {
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
