use crate::base::ast::{Str};
use crate::base::ast::visit::*;
use super::state::*;
use crate::css::ast::*;

struct AssetFinder {
  found: Vec<String>
}

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
      DocumentBodyItem::DocComment,
      DocumentBodyItem::Element,
      DocumentBodyItem::Import,
      DocumentBodyItem::Style,
      DocumentBodyItem::Text,
      DocumentBodyItem::Trigger
    )
  },
  Str(self, expr) {
    println!("STRRR");
  },
  Atom(self, expr) {
    self.visit(expr);
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
  Component(self, expr) {

  },
  Comment(self, expr) {},
  Element(self, expr) {

  },
  Import(self, expr) {

  },
  Style(self, expr) {
    visit_each!(self, &expr.declarations);

  },
  TextNode(self, expr) {

  },
  Trigger(self, expr) {

  }
}

impl Document {
  fn get_assets(&self) -> Vec<String> {
    let mut finder = AssetFinder { found: vec![] };
    finder.visit(self);
    finder.found
  }
}
