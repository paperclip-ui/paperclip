pub trait Visitor<V> {
    fn visit(&mut self, item: &V);
}

#[macro_export]
macro_rules! visitor {
    (
        $name:ident,
        $(
            $match:ident($self:ident, $id:ident) $body:block
        ),*
    ) => {
        $(
                impl Visitor<$match> for $name {
                    fn visit(&mut $self, $id: &$match) $body
                }
        )*
    };
}

#[macro_export]
macro_rules! visit_each {
    ($self: ident, $items: expr) => {
        for item in $items {
            $self.visit(item);
        }
    };
}

#[macro_export]
macro_rules! visit_enum {
($self: ident, $item: ident, $($member: path),* $(,_)?) => {
  match $item {
    $(
      $member(inner) => {
        $self.visit(inner);
      }
    )*
    _ => {}
  }
};
}