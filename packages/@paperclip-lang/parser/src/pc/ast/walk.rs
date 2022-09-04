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
  ($item: ident, $($member: expr),*) => {
    match $item {
      $(
        $member(expr) => {
          expr.accept(self);
        }
      )*
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
        Expression::Component(component) => {
          for child in &component.body {
            child.accept(self);
          }
        },
        Expression::ComponentBodyItem(item) => {
          accept_enum!(item, 
            ast::ComponentBodyItem::Render,
            ast::ComponentBodyItem::Script
          )
        },
        _ => {}
      }
    }
}
