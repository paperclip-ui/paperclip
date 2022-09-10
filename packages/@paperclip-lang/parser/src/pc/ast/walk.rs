use super::state as ast;
use super::visit::{Expression, Visitable, Visitor};
use crate::base::ast as base_ast;

type EachFn = dyn Fn(&Expression) -> bool;

pub struct Walker {
    should_continue: bool,
    each: Box<EachFn>,
}

impl Walker {
    pub fn new(each: Box<EachFn>) -> Self {
        Self {
            each,
            should_continue: true,
        }
    }
}

macro_rules! each {
    ($self:ident, $expr: expr) => {{
        $self.should_continue = $self.should_continue && ($self.each)($expr);
        $self.should_continue
    }};
}

macro_rules! accept_enum {
  ($self: ident, $item: ident, $($member: path),*) => {
    match $item {
      $(
        $member(expr) => {
          expr.accept($self);
        }
      )*
    }
  };
}

macro_rules! accept_each {
    ($self: ident, $items: expr) => {
        for item in $items {
            item.accept($self);
        }
    };
}

impl Visitor for Walker {
    fn visit<V: Visitable>(&mut self, visitable: &V) {
        let expr = visitable.wrap();
        if !each!(self, &expr) {
            return;
        }

        match expr {
            Expression::Document(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::Render(expr) => {
                expr.node.accept(self);
            }
            Expression::RenderNode(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::RenderNode::Element,
                    ast::RenderNode::Slot,
                    ast::RenderNode::Text
                );
            }
            Expression::DocumentBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::DocumentBodyItem::Atom,
                    ast::DocumentBodyItem::Component,
                    ast::DocumentBodyItem::DocComment,
                    ast::DocumentBodyItem::Element,
                    ast::DocumentBodyItem::Import,
                    ast::DocumentBodyItem::Style,
                    ast::DocumentBodyItem::Text,
                    ast::DocumentBodyItem::Trigger
                );
            }
            Expression::Component(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::ComponentBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::ComponentBodyItem::Render,
                    ast::ComponentBodyItem::Script,
                    ast::ComponentBodyItem::Variant
                )
            }
            Expression::Element(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::Trigger(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::Override(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::Slot(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::TextNode(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::TextNodeBodyItem(expr) => {
                accept_enum!(self, expr, ast::TextNodeBodyItem::Style);
            }
            Expression::Variant(expr) => {
                accept_each!(self, &expr.triggers);
            }
            Expression::Style(expr) => {
                // TODO
            }
            Expression::SlotBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::SlotBodyItem::Element,
                    ast::SlotBodyItem::Text
                );
            }
            Expression::Insert(expr) => {
                accept_each!(self, &expr.body);
            }
            Expression::InsertBody(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::InsertBody::Element,
                    ast::InsertBody::Slot,
                    ast::InsertBody::Text
                );
            }
            Expression::OverrideBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::OverrideBodyItem::Style,
                    ast::OverrideBodyItem::Variant
                );
            }
            Expression::TriggerBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::TriggerBodyItem::Boolean,
                    ast::TriggerBodyItem::Reference,
                    ast::TriggerBodyItem::String
                );
            }
            Expression::ElementBodyItem(expr) => {
                accept_enum!(
                    self,
                    expr,
                    ast::ElementBodyItem::Element,
                    ast::ElementBodyItem::Insert,
                    ast::ElementBodyItem::Override,
                    ast::ElementBodyItem::Slot,
                    ast::ElementBodyItem::Style,
                    ast::ElementBodyItem::Text
                );
            }
            Expression::Atom(_)
            | Expression::Import(_)
            | Expression::Str(_)
            | Expression::Reference(_)
            | Expression::Script(_)
            | Expression::Boolean(_)
            | Expression::Comment(_) => {}
        }
    }
}
