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
            Expression::Atom(_) => {}
        }
    }
}
