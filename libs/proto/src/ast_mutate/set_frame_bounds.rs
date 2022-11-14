use super::base::*;
use crate::ast::{
    self,
    all::Visitor,
    all::{Expression, VisitorResult},
};

impl Visitor for SetFrameBounds {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult {
        if let Some(frame_index) = expr.body.iter().position(|expr| {
            expr.get_inner().get_id() == &self.frame_id
        }) {
            // TODO: should _parse_ content instead
            let new_comment = ast::docco::Comment {
                id: "comment".to_string(),
                range: None,
                body: vec![
                    ast::docco::comment_body_item::Inner::Property(ast::docco::Property {
                        id: "prop".to_string(),
                        range: None,
                        name: "bounds".to_string(),
                        value: Some(
                            ast::docco::property_value::Inner::Parameters(ast::docco::Parameters {
                                id: "params".to_string(),
                                range: None,
                                items: vec![
                                    ast::docco::Parameter {
                                        id: "x".to_string(),
                                        name: "x".to_string(),
                                        range: None,
                                        value: Some(
                                            ast::docco::parameter_value::Inner::Num(
                                                ast::base::Num {
                                                    id: "x1".to_string(),
                                                    range: None,
                                                    value: self.bounds.as_ref().unwrap().x,
                                                },
                                            )
                                            .get_outer(),
                                        ),
                                    },
                                    ast::docco::Parameter {
                                        id: "x".to_string(),
                                        name: "y".to_string(),
                                        range: None,
                                        value: Some(
                                            ast::docco::parameter_value::Inner::Num(
                                                ast::base::Num {
                                                    id: "x1".to_string(),
                                                    range: None,
                                                    value: self.bounds.as_ref().unwrap().y,
                                                },
                                            )
                                            .get_outer(),
                                        ),
                                    },
                                    ast::docco::Parameter {
                                        id: "x".to_string(),
                                        name: "width".to_string(),
                                        range: None,
                                        value: Some(
                                            ast::docco::parameter_value::Inner::Num(
                                                ast::base::Num {
                                                    id: "x1".to_string(),
                                                    range: None,
                                                    value: self.bounds.as_ref().unwrap().width,
                                                },
                                            )
                                            .get_outer(),
                                        ),
                                    },
                                    ast::docco::Parameter {
                                        id: "x".to_string(),
                                        name: "height".to_string(),
                                        range: None,
                                        value: Some(
                                            ast::docco::parameter_value::Inner::Num(
                                                ast::base::Num {
                                                    id: "x1".to_string(),
                                                    range: None,
                                                    value: self.bounds.as_ref().unwrap().height,
                                                },
                                            )
                                            .get_outer(),
                                        ),
                                    },
                                ],
                            })
                            .get_outer(),
                        ),
                    })
                    .get_outer(),
                ],
            };

            if frame_index > 0 {
                if let Some(item) = expr.body.get_mut(frame_index - 1) {
                    if let ast::pc::document_body_item::Inner::DocComment(comment) =
                        item.get_inner_mut()
                    {
                        std::mem::replace(comment, new_comment);
                    }
                }
            } else {
                expr.body.insert(
                    0,
                    ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer(),
                );
            }

            return VisitorResult::Stop;
        }

        VisitorResult::Continue
    }
}
