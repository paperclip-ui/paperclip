pub use super::base;
pub use super::docco;
pub use super::pc;
use std::borrow::Borrow;

macro_rules! expressions {
  ($(($name:ident, $expr:ty, $this:ident => $id_ret:expr)),*) => {

      #[derive(Clone)]
      pub enum ImmutableExpressionRef<'a> {
          $(
              $name(&'a $expr),
          )*
      }


      impl<'a> ImmutableExpressionRef<'a> {
          pub fn get_id(&self) -> &str {
              match self {
                  $(
                      ImmutableExpressionRef::$name(exp) => {
                          exp.get_id()
                      },
                  )*
              }
          }
      }

      pub trait Expression {
          fn outer<'a>(&'a self) -> ImmutableExpressionRef<'a>;
          fn get_id<'a>(&'a self) -> &'a str;
      }

      $(
          impl Expression for $expr {
              fn outer<'a>(&'a self) -> ImmutableExpressionRef<'a> {
                  ImmutableExpressionRef::$name(self.borrow())
              }
              fn get_id<'a>(&'a $this) -> &'a str {
                  $id_ret
              }
          }

          impl<'a> TryFrom<ImmutableExpressionRef<'a>> for &'a $expr {
              type Error = ();
              fn try_from(outer: ImmutableExpressionRef<'a>) -> Result<Self, Self::Error> {
                  match outer {
                      ImmutableExpressionRef::$name(inner) => Ok(&inner),
                      _ => Err(())
                  }
              }
          }
      )*
  };
}

pub trait Visitable<'a, T> {
    fn accept(&'a self, visitor: &mut dyn Visitor<T>) -> bool;
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
                fn accept(&$lt $self, $id: &mut dyn Visitor<$type>) -> bool $body
            }
      )*
  };
}

macro_rules! match_each_expr_id {
  ($this:ident, $($name:path),*) => {
      match $this {
          $(
              $name(expr) => &expr.id,
          )*
      }
  };
}

expressions! {
  (Document, pc::Document, self => &self.id),
  (DocumentBodyItem, pc::DocumentBodyItem, self => &self.get_inner().get_id()),
  (DocumentBodyItemInner, pc::document_body_item::Inner, self => match_each_expr_id!(self,
      pc::document_body_item::Inner::Import,
      pc::document_body_item::Inner::Style,
      pc::document_body_item::Inner::Component,
      pc::document_body_item::Inner::DocComment,
      pc::document_body_item::Inner::Text,
      pc::document_body_item::Inner::Atom,
      pc::document_body_item::Inner::Trigger,
      pc::document_body_item::Inner::Element
  )),
  (Import, pc::Import, self => &self.id),
  (Style, pc::Style, self => &self.id),
  (Component, pc::Component, self => &self.id),
  (ComponentBodyItem, pc::ComponentBodyItem, self => self.get_inner().get_id()),
  (ComponentBodyItemInner, pc::component_body_item::Inner, self => match_each_expr_id!(self,
    pc::component_body_item::Inner::Render,
    pc::component_body_item::Inner::Variant,
    pc::component_body_item::Inner::Script
  )),
  (Script, pc::Script, self => &self.id),
  (Variant, pc::Variant, self => &self.id),
  (Render, pc::Render, self => &self.id),
  (Atom, pc::Atom, self => &self.id),
  (Trigger, pc::Trigger, self => &self.id),
  (TriggerBodyItem, pc::TriggerBodyItem, self => self.get_inner().get_id()),
  (TriggerBodyItemInner, pc::trigger_body_item::Inner, self => match_each_expr_id!(self,
    pc::trigger_body_item::Inner::Str,
    pc::trigger_body_item::Inner::Reference,
    pc::trigger_body_item::Inner::Boolean
  )),
  (TextNode, pc::TextNode, self => &self.id),
  (Parameter, pc::Parameter, self => &self.id),
  (SimpleExpression,pc::SimpleExpression, self => &self.get_inner().get_id()),
  (SimpleExpressionInner, pc::simple_expression::Inner, self => match_each_expr_id!(self,
    pc::simple_expression::Inner::Str,
    pc::simple_expression::Inner::Number,
    pc::simple_expression::Inner::Boolean,
    pc::simple_expression::Inner::Reference,
    pc::simple_expression::Inner::Array
  )),
  (Reference, pc::Reference, self => &self.id),
  (Array, pc::Array, self => &self.id),
  (Element, pc::Element, self => &self.id),
  (Node, pc::Node, self => &self.get_inner().get_id()),
  (NodeInner, pc::node::Inner, self => match_each_expr_id!(self,
    pc::node::Inner::Slot,
    pc::node::Inner::Insert,
    pc::node::Inner::Style,
    pc::node::Inner::Element,
    pc::node::Inner::Text,
    pc::node::Inner::Override
  )),
  (Slot, pc::Slot, self => &self.id),
  (Insert, pc::Insert, self => &self.id),
  (Override, pc::Override, self => &self.id),
  (OverrideBodyItem, pc::OverrideBodyItem, self => self.get_inner().get_id()),
  (OverrideBodyItemInner, pc::override_body_item::Inner, self => match_each_expr_id!(self,
    pc::override_body_item::Inner::Style,
    pc::override_body_item::Inner::Variant
  )),

  (Comment, docco::Comment, self => &self.id),
  (Str, base::Str, self => &self.id),
  (Boolean, base::Boolean, self => &self.id),
  (Number, base::Number, self => &self.id)

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

visitable!(<'a, ImmutableExpressionRef<'a>> {
    pc::Document => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.body, visitor)
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
        visitor.visit(self.outer())
    },
    pc::Style => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Component => (self, visitor) {
        visitor.visit(self.outer())
    },
    docco::Comment => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::TextNode => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Atom => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Trigger => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Parameter => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Node => (self, visitor) {
        visitor.visit(self.outer())
    },
    pc::Element => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.parameters, visitor) && visit_each!(&self.body, visitor)
    },
    pc::Slot => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.body, visitor)
    },
    pc::Insert => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.body, visitor)
    },
    pc::Override => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.body, visitor)
    },
    pc::OverrideBodyItem => (self, visitor) {
        visit_enum!(self.get_inner(), visitor, pc::override_body_item::Inner::Style, pc::override_body_item::Inner::Variant)
    },
    pc::Variant => (self, visitor) {
        visitor.visit(self.outer()) && visit_each!(&self.triggers, visitor)
    },
    pc::TriggerBodyItem => (self, visitor) {
        visit_enum!(self.get_inner(), visitor, pc::trigger_body_item::Inner::Str, pc::trigger_body_item::Inner::Reference, pc::trigger_body_item::Inner::Boolean)
    },
    pc::Reference => (self, visitor) {
        visitor.visit(self.outer())
    },
    base::Str => (self, visitor) {
        visitor.visit(self.outer())
    },
    base::Boolean => (self, visitor) {
        visitor.visit(self.outer())
    }
});

pub struct ExprFinder<'a> {
    found: Option<ImmutableExpressionRef<'a>>,
    filter: Box<dyn Fn(&ImmutableExpressionRef<'a>) -> bool>,
}

impl<'a> ExprFinder<'a> {
    pub fn find<TFilter>(
        expr: ImmutableExpressionRef<'a>,
        filter: TFilter,
    ) -> Option<ImmutableExpressionRef<'a>>
    where
        TFilter: Fn(&ImmutableExpressionRef<'a>) -> bool + 'static,
    {
        let mut finder = ExprFinder {
            found: None,
            filter: Box::new(filter),
        };

        finder.visit(expr);

        finder.found
    }
}

impl<'a> Visitor<ImmutableExpressionRef<'a>> for ExprFinder<'a> {
    fn visit(&mut self, expr: ImmutableExpressionRef<'a>) -> bool {
        if (self.filter)(&expr) {
            self.found = Some(expr);
        }
        matches!(self.found, None)
    }
}
