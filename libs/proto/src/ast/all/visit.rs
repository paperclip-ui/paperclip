use super::MutableExpressionRef;
use super::{Expression};
pub use super::super::base;
pub use super::super::docco;
pub use super::super::pc;

pub trait Visitable<'a, T> {
  fn accept(&'a mut self, visitor: &mut dyn Visitor<T>) -> bool;
}

pub trait Visitor<T> {
  fn visit(&mut self, item: T) -> bool;
}

macro_rules! visitable {
(
    <$lt: lifetime, $type:ty> {
        $(
            $match:path => ($self:ident, $id:ident) $body:block
        ),*
    }

) => {
    $(
          impl<$lt> Visitable<$lt, $type> for $match {
              fn accept(&$lt mut $self, $id: &mut dyn Visitor<$type>) -> bool $body
          }
    )*
};
}

macro_rules! visit_enum {
  ($this: expr, $visitor:expr, $($name: path), *) => {
      match $this {
          $(
              $name(expr) => {
                  expr.accept($visitor)
              }
          )*
      }
  };
}

macro_rules! visit_each {
  ($items: expr, $visitor:expr) => {{
      let mut accepted = true;
      for item in $items {
          if !item.accept($visitor) {
              accepted = false;
              break;
          }
      }
      accepted
  }};
}


visitable!(<'a, MutableExpressionRef<'a>> {
  pc::Document => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&mut self.body, visitor)
  },
  pc::DocumentBodyItem => (self, visitor) {
      visit_enum!(self.get_inner(), visitor,
          pc::document_body_item::Inner::Import,
          pc::document_body_item::Inner::Style,
          pc::document_body_item::Inner::Component,
          pc::document_body_item::Inner::DocComment,
          pc::document_body_item::Inner::Text,
          pc::document_body_item::Inner::Atom,
          pc::document_body_item::Inner::Trigger,
          pc::document_body_item::Inner::Element
      )
  },
  pc::Import => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Style => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Component => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  docco::Comment => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::TextNode => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Atom => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Trigger => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Parameter => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Node => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  pc::Element => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&self.parameters, visitor) && visit_each!(&self.body, visitor)
  },
  pc::Slot => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&self.body, visitor)
  },
  pc::Insert => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&self.body, visitor)
  },
  pc::Override => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&self.body, visitor)
  },
  pc::OverrideBodyItem => (self, visitor) {
      visit_enum!(self.get_inner(), visitor, pc::override_body_item::Inner::Style, pc::override_body_item::Inner::Variant)
  },
  pc::Variant => (self, visitor) {
      visitor.visit(self.outer_mut()) && visit_each!(&self.triggers, visitor)
  },
  pc::TriggerBodyItem => (self, visitor) {
      visit_enum!(self.get_inner(), visitor, pc::trigger_body_item::Inner::Str, pc::trigger_body_item::Inner::Reference, pc::trigger_body_item::Inner::Boolean)
  },
  pc::Reference => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  base::Str => (self, visitor) {
      visitor.visit(self.outer_mut())
  },
  base::Boolean => (self, visitor) {
      visitor.visit(self.outer_mut())
  }
});
