use super::base::*;
use crate::ast::{
    self,
    all::Visitor,
    all::{Expression, VisitorResult},
};

impl Visitor for SetFrameBounds {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {

      println!("APPLY DOC!");
      if let Some(frame_index) = expr.body.iter().position(|expr| {
        expr.get_id() == &self.frame_id
      }) {

        let new_comment = ast::docco::Comment {
          id: "comment".to_string(),
          range: None,
          body: vec![

          ]
        };


        if frame_index > 0 {
          if let Some(item) = expr.body.get_mut(frame_index - 1) {
            if let ast::pc::document_body_item::Inner::DocComment(comment) = item.get_inner_mut() {
              std::mem::replace(comment, new_comment);
            }
          }
        } else {
          expr.body.insert(0, ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer());
        }
      }

        VisitorResult::Continue
    }
}
