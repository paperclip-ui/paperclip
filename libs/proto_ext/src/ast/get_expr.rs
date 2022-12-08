use paperclip_proto::ast::all::ExpressionWrapper;
use paperclip_proto::ast;

use crate::ast::all::Visitable;

use super::all::{Visitor, VisitorResult};


pub struct GetExpr {
  id: String,
  reference: Option<ExpressionWrapper>,
}

macro_rules! getters {
    ($(($name: ident, $expr: ty)), *) => {
        $(
          fn $name(&mut self, expr: &mut $expr) -> VisitorResult<()> {
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
  pub fn get_expr(id: &str, doc: &mut ast::pc::Document) -> Option<ExpressionWrapper> {
      let mut imp = GetExpr {
          id: id.to_string(),
          reference: None,
      };
      doc.accept(&mut imp);
      imp.reference.clone()
  }
}
