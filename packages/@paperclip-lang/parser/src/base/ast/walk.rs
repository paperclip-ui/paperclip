macro_rules! walker {
  () => {
    
  };
}


#[macro_export]
macro_rules! each {
  ($self:ident, $expr: expr) => {{
      $self.should_continue = $self.should_continue && ($self.each)($expr);
      $self.should_continue
  }};
}

#[macro_export]
macro_rules! visit_enum {
($self: ident, $item: ident, $($member: path),*) => {
  match $item {
    $(
      $member(expr) => {
        $self.visit($item);
      }
    )*
  }
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