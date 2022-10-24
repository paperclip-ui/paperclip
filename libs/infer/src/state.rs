use std::collections::BTreeMap;


pub enum Type {
  Str,
  Number,
  Boolean,
  Optional(Box<Type>),
  Function(Function),
  Map(BTreeMap<String, Type>)
}

pub struct Function {
  pub arguments: Vec<Type>
}