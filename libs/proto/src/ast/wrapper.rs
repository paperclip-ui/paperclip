use super::base;
use super::css;
use super::docco;
use super::pc;
use super::shared;
use super::visit;

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
        pub fn checksum(&self) -> String {
            match self {
                $(
                    ExpressionWrapper::$name(exp) => {
                        exp.checksum()
                    },
                )*
            }
        }
    }

    impl visit::MutableVisitable for ExpressionWrapper {
        fn accept<TRet, TVisitor: visit::MutableVisitor<TRet>>(&mut self, visitor: &TVisitor) -> visit::VisitorResult<TRet, TVisitor> {
            match self {
                $(
                    ExpressionWrapper::$name(exp) => {
                        exp.accept(visitor)
                    },
                )*
            }
        }
    }


    impl visit::Visitable for ExpressionWrapper {
            fn accept<TRet, TVisitor: visit::Visitor<TRet>>(&self, visitor: &TVisitor) -> visit::VisitorResult<TRet, TVisitor> {
                match self {
                    $(
                        ExpressionWrapper::$name(exp) => {
                            exp.accept(visitor)
                        },
                    )*
                }
            }
        }


        impl visit::Visitable for &ExpressionWrapper {
                    fn accept<TRet, TVisitor: visit::Visitor<TRet>>(&self, visitor: &TVisitor) -> visit::VisitorResult<TRet, TVisitor> {
                        match self {
                            $(
                                ExpressionWrapper::$name(exp) => {
                                    exp.accept(visitor)
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
          impl From<&$expr> for ExpressionWrapper {
            fn from(expr: &$expr) -> Self {
                ExpressionWrapper::$name(expr.clone())
            }
          }
          impl From<$expr> for ExpressionWrapper {
            fn from(expr: $expr) -> Self {
                ExpressionWrapper::$name(expr)
            }
          }



          impl<'a> TryFrom<&'a ExpressionWrapper> for &'a $expr {
            type Error = ();
            fn try_from(wrapper: &'a ExpressionWrapper) -> Result<Self, Self::Error>  {
                match wrapper {
                    ExpressionWrapper::$name(expr) => {
                        Ok(&expr)
                    },
                    _ => {
                        Err(())
                    }
                }
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
  ($this:expr, $($name:path),*) => {
      match $this {
          $(
              $name(expr) => &expr.id,
          )*
      }
  };
}

expressions! {
  (Document, pc::Document, self => &self.id),
  (Import, pc::Import, self => &self.id),
  (Style, pc::Style, self => &self.id),
  (Component, pc::Component, self => &self.id),
  // (ComponentBodyItem, pc::ComponentBodyItem, self => self.get_inner().get_id()),
  (ComponentBodyItem, pc::ComponentBodyItem, self => match_each_expr_id!(&self.get_inner(),
    pc::component_body_item::Inner::Render,
    pc::component_body_item::Inner::Variant,
    pc::component_body_item::Inner::Script
  )),
  (Script, pc::Script, self => &self.id),
  (Variant, pc::Variant, self => &self.id),
  (Render, pc::Render, self => &self.id),
  (Atom, pc::Atom, self => &self.id),
  (Trigger, pc::Trigger, self => &self.id),
  (TriggerBodyItem, pc::TriggerBodyItem, self => match_each_expr_id!(&self.get_inner(),
    pc::trigger_body_item::Inner::Str,
    pc::trigger_body_item::Inner::Reference,
    pc::trigger_body_item::Inner::Bool
  )),
  (TriggerBodyItemCombo, pc::TriggerBodyItemCombo, self => &self.id),
  (SpacedList, css::SpacedList, self => &self.id),
  (CommaList, css::CommaList, self => &self.id),
  (HexColor, css::HexColor, self => &self.id),
  (Arithmetic, Box<css::Arithmetic>, self => &self.id),
  (Keyword, css::Keyword, self => &self.id),
  (Measurement, css::Measurement, self => &self.id),
  (StyleDeclaration, css::StyleDeclaration, self => &self.id),
  (FunctionCall, Box<css::FunctionCall>, self => &self.id),
  (TextNode, pc::TextNode, self => &self.id),
  (Parameter, pc::Parameter, self => &self.id),
  // (SimpleExpression,pc::SimpleExpression, self => &self.get_inner().get_id()),
  (SimpleExpression, pc::SimpleExpression, self => match_each_expr_id!(&self.get_inner(),
    pc::simple_expression::Inner::Str,
    pc::simple_expression::Inner::Num,
    pc::simple_expression::Inner::Bool,
    pc::simple_expression::Inner::Reference,
    pc::simple_expression::Inner::Ary
  )),
  (Reference, shared::Reference, self => &self.id),
  (Ary, pc::Ary, self => &self.id),
  (Element, pc::Element, self => &self.id),
  (Node, pc::Node, self => match_each_expr_id!(&self.get_inner(),
    pc::node::Inner::Slot,
    pc::node::Inner::Insert,
    pc::node::Inner::Style,
    pc::node::Inner::Element,
    pc::node::Inner::Text,
    pc::node::Inner::Atom,
    pc::node::Inner::Trigger,
    pc::node::Inner::Override,
    pc::node::Inner::Component,
    pc::node::Inner::DocComment,
    pc::node::Inner::Import,
    pc::node::Inner::Repeat,
    pc::node::Inner::Switch,
    pc::node::Inner::Script,
    pc::node::Inner::Condition
  )),
  (Repeat, pc::Repeat, self => &self.id),
  (Condition, pc::Condition, self => &self.id),
  (Switch, pc::Switch, self => &self.id),
  // (SwitchItem, pc::SwitchItem, self => &self.get_inner().get_id()),
  (SwitchItem, pc::SwitchItem, self => match_each_expr_id!(self.get_inner(),
      pc::switch_item::Inner::Case,
      pc::switch_item::Inner::Default
  )),
  (SwitchCase, pc::SwitchCase, self => &self.id),
  (SwitchDefault, pc::SwitchDefault, self => &self.id),
  (Slot, pc::Slot, self => &self.id),
  (Insert, pc::Insert, self => &self.id),
  (Override, pc::Override, self => &self.id),
  // (OverrideBodyItem, pc::OverrideBodyItem, self => self.get_inner().get_id()),
  (OverrideBodyItem, pc::OverrideBodyItem, self => match_each_expr_id!(self.get_inner(),
    pc::override_body_item::Inner::Style,
    pc::override_body_item::Inner::Variant
  )),

  (Comment, docco::Comment, self => &self.id),
  (Str, base::Str, self => &self.id),
  (Boolean, base::Bool, self => &self.id),
  (Number, base::Num, self => &self.id)

}

impl ExpressionWrapper {
    pub fn get_name(&self) -> Option<String> {
        match self {
            ExpressionWrapper::Atom(atom) => Some(atom.name.to_string()),
            ExpressionWrapper::Component(component) => Some(component.name.to_string()),
            ExpressionWrapper::Style(style) => style.name.clone(),
            ExpressionWrapper::Element(element) => element.name.clone(),
            ExpressionWrapper::TextNode(text_node) => text_node.name.clone(),
            ExpressionWrapper::Trigger(trigger) => Some(trigger.name.clone()),
            _ => None,
        }
    }

    pub fn rename(self, new_name: &str) -> ExpressionWrapper {
        match self {
            ExpressionWrapper::Atom(atom) => pc::Atom {
                name: new_name.to_string(),
                ..atom
            }
            .into(),
            ExpressionWrapper::Component(atom) => pc::Component {
                name: new_name.to_string(),
                ..atom
            }
            .into(),
            ExpressionWrapper::Style(atom) => pc::Style {
                name: Some(new_name.to_string()),
                ..atom
            }
            .into(),
            ExpressionWrapper::Element(expr) => pc::Element {
                name: Some(new_name.to_string()),
                ..expr
            }
            .into(),
            ExpressionWrapper::TextNode(expr) => pc::TextNode {
                name: Some(new_name.to_string()),
                ..expr
            }
            .into(),
            ExpressionWrapper::Trigger(expr) => pc::Trigger {
                name: new_name.to_string(),
                ..expr
            }
            .into(),
            _ => self,
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Node {
    type Error = ();

    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Node(node) => Ok(node.clone()),
            ExpressionWrapper::Element(node) => Ok(node.into()),
            ExpressionWrapper::TextNode(node) => Ok(node.into()),
            ExpressionWrapper::Insert(node) => Ok(node.into()),
            ExpressionWrapper::Slot(node) => Ok(node.into()),
            ExpressionWrapper::Component(node) => Ok(node.into()),
            ExpressionWrapper::Import(node) => Ok(node.into()),
            ExpressionWrapper::Style(node) => Ok(node.into()),
            ExpressionWrapper::Atom(node) => Ok(node.into()),
            ExpressionWrapper::Trigger(node) => Ok(node.into()),
            _ => Err(()),
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Document {
    type Error = ();

    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Document(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Variant {
    type Error = ();

    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Variant(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}
impl TryFrom<ExpressionWrapper> for pc::Component {
    type Error = ();

    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Component(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Element {
    type Error = ();

    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Element(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Style {
    type Error = ();
    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Style(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}

impl TryFrom<ExpressionWrapper> for pc::Slot {
    type Error = ();
    fn try_from(value: ExpressionWrapper) -> Result<Self, Self::Error> {
        match &value {
            ExpressionWrapper::Slot(node) => Ok(node.clone()),
            _ => Err(()),
        }
    }
}
