

#[macro_export]
macro_rules! visitable_expr {
  ($($expr: ident),*) => {

      pub trait Visitor {
        fn visit<V: Visitable>(&mut self, visitable: &V);
      }

      pub trait Visitable {
        fn wrap<'expr>(&'expr self) -> Expression<'expr>;
      }

      pub enum Expression<'expr> {
          $(
              $expr(&'expr $expr),
          )*
      }

      $(
          impl Visitable for $expr {
              fn wrap<'expr>(&'expr self) -> Expression<'expr> {
                  Expression::$expr(self)
              }
          }
      )*
  };

}