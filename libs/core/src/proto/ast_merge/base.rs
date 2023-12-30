/*
document.merge(document);

*/

pub trait Mergeable<Type> {
    fn merge(&mut self, other: &Type);
}

#[macro_export]
macro_rules! mergeable {
  (
    $(
        ($expr:path, ($self:ident, $other:ident) $merge_fn:block)
    ),*
  ) => {
    $(
      impl Mergeable<$expr> for $expr {
        fn merge(&mut $self, $other: &$expr) $merge_fn
      }
    )*
  };
}
