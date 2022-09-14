use super::state::*;
use crate::base::ast::visit::*;
use crate::base::ast::Str;
use crate::css::ast::*;

struct AssetFinder;

visitor! {
  AssetFinder,
  Document(self, expr) {
    visit_each!(self, &expr.body);
  },
  DocumentBodyItem(self, expr) {
    visit_enum!(
      self,
      expr,
      DocumentBodyItem::Atom,
      DocumentBodyItem::Component,
      DocumentBodyItem::Element,
      DocumentBodyItem::Style,
      DocumentBodyItem::Text
    )
  },
  Str(self, _expr) {
  },
  Atom(self, _expr) {
  },
  StyleDeclaration(self, expr) {
    self.visit(&expr.value);
  },
  DeclarationValue(self, expr) {
    visit_enum!(
      self,
      expr,
      DeclarationValue::CommaList,
      DeclarationValue::SpacedList,
      DeclarationValue::String
    )
  },
  CommaList(self, expr) {
    visit_each!(self, expr.items.iter());
  },
  SpacedList(self, expr) {
    visit_each!(self, expr.items.iter());
  },
  Component(self, _expr) {

  },
  Element(self, expr) {
    visit_each!(self, &expr.parameters);
  },
  Parameter(self, expr) {
    self.visit(&expr.value);
  },
  SimpleExpression(self, expr) {
    visit_enum!(
      self,
      expr,
      SimpleExpression::Array,
      SimpleExpression::String
    )
  },
  Array(self, expr) {
    visit_each!(self, &expr.items);
  },
  Style(self, expr) {
    visit_each!(self, &expr.declarations);

  },
  TextNode(self, _expr) {

  }
}
