use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::DeleteExpression;

use crate::ast::{all::Visitor, all::VisitorResult};
macro_rules! try_remove_child {
    ($children:expr, $id: expr) => {
        {
            let mut found_i = None;

            for (i, item) in $children.iter().enumerate() {
              if item.get_id() == $id {
                found_i = Some(i);
              }
            }

            if let Some(i) = found_i {
              $children.remove(i);
              true
            } else {
              false
            }
        }
    };
}

impl Visitor for DeleteExpression {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
      if try_remove_child!(expr.body, &self.expression_id) {
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult {
      if try_remove_child!(expr.body, &self.expression_id) {
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult {
      if try_remove_child!(expr.body, &self.expression_id) {
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
}
