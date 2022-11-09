use super::{Visitor, MutableExpressionRef};


pub struct ExprFinder<'a> {
  found: Option<MutableExpressionRef<'a>>,
  filter: Box<dyn Fn(&MutableExpressionRef<'a>) -> bool>,
}

impl<'a> ExprFinder<'a> {
  pub fn find<TFilter>(
      expr: MutableExpressionRef<'a>,
      filter: TFilter,
  ) -> Option<MutableExpressionRef<'a>>
  where
      TFilter: Fn(&MutableExpressionRef<'a>) -> bool + 'static,
  {
      let mut finder = ExprFinder {
          found: None,
          filter: Box::new(filter),
      };

      expr.a

      finder.found
  }
}

impl<'a> Visitor<MutableExpressionRef<'a>> for ExprFinder<'a> {
  fn visit(&mut self, expr: MutableExpressionRef<'a>) -> bool {
      if (self.filter)(&expr) {
          self.found = Some(expr);
      }
      matches!(self.found, None)
  }
}
