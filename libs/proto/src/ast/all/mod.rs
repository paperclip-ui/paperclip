pub use super::base;
pub use super::docco;
pub use super::pc;
use crc::{Crc, CRC_32_ISCSI};

const CASTAGNOLI: Crc<u32> = Crc::<u32>::new(&CRC_32_ISCSI);

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

    #[derive(Clone, Debug)]
    pub enum ExpressionWrapper {
        $(
            $name($expr),
        )*
    }


    impl ExpressionWrapper {
        pub fn get_id(&self) -> &str {
            match self {
                $(
                    ExpressionWrapper::$name(exp) => {
                        exp.get_id()
                    },
                )*
            }
        }
    }


    #[derive(Clone)]
    pub enum ImmutableExpression {
        $(
            $name($expr),
        )*
    }

    impl<'a> From<ImmutableExpressionRef<'a>> for ImmutableExpression {
        fn from(outer: ImmutableExpressionRef<'a>) -> Self {
            match outer {
                $(
                    ImmutableExpressionRef::$name(inner) => ImmutableExpression::$name(inner.clone()),
                )*
            }
        }
    }


      pub trait Expression {
          fn get_id<'a>(&'a self) -> &'a str;
          fn checksum(&self) -> String;
      }

      $(
          impl Expression for $expr {
              fn get_id<'a>(&'a $this) -> &'a str {
                  $id_ret
              }
              fn checksum(&self) -> String {
                  format!("{:x}", CASTAGNOLI.checksum(format!("{:?}", self).as_bytes())).to_string()
              }
          }
          impl<'a> From<&'a $expr> for ImmutableExpressionRef<'a> {
            fn from(expr: &'a $expr) -> Self {
                ImmutableExpressionRef::$name(expr)
            }
          }
          impl From<&mut $expr> for ExpressionWrapper {
            fn from(expr: &mut $expr) -> Self {
                ExpressionWrapper::$name(expr.clone())
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
    pc::trigger_body_item::Inner::Bool
  )),
  (TextNode, pc::TextNode, self => &self.id),
  (Parameter, pc::Parameter, self => &self.id),
  (SimpleExpression,pc::SimpleExpression, self => &self.get_inner().get_id()),
  (SimpleExpressionInner, pc::simple_expression::Inner, self => match_each_expr_id!(self,
    pc::simple_expression::Inner::Str,
    pc::simple_expression::Inner::Num,
    pc::simple_expression::Inner::Bool,
    pc::simple_expression::Inner::Reference,
    pc::simple_expression::Inner::Ary
  )),
  (Reference, pc::Reference, self => &self.id),
  (Ary, pc::Ary, self => &self.id),
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
  (Boolean, base::Bool, self => &self.id),
  (Number, base::Num, self => &self.id)

}
