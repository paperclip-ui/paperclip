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
              Some(i)
            } else {
              None
            }
        }
    };
}

impl Visitor for DeleteExpression {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
      if let Some(i) = try_remove_child!(expr.body, &self.expression_id) {
        let prev_index = i - 1;
        if prev_index >= 0 {
          if let Some(child) = expr.body.get(prev_index) {
            if matches!(child.get_inner(), ast::pc::document_body_item::Inner::DocComment(_)) {
              expr.body.remove(prev_index);
            }
          }
        }
        
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult {
      if matches!(try_remove_child!(expr.body, &self.expression_id), Some(_)) {
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult {
      if matches!(try_remove_child!(expr.body, &self.expression_id), Some(_)) {
        VisitorResult::Stop
      } else {
        VisitorResult::Continue
      }
    }
}
