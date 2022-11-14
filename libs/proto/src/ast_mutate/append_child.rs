use super::base::*;
use crate::ast::{
    self,
    all::Visitor,
    all::{Expression, VisitorResult},
};

impl Visitor for AppendChild {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
        if expr.get_id() == &self.parent_id {
            expr.body.push(
                self.child
                    .clone()
                    .expect("Child must exist")
                    .try_into()
                    .unwrap(),
            );
            return VisitorResult::Stop
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult {
        if expr.get_id() == &self.parent_id {
            expr.body
                .push(self.child.clone().expect("Child must exist"));
        }
        VisitorResult::Continue
    }
}
