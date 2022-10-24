use std::collections::BTreeMap;

#[derive(Clone, Debug, PartialEq)]
pub enum Type {
    Unknown,
    String,
    Number,
    Boolean,
    Optional(Box<Type>),
    Callback(Callback),
    Component(Component),
    Reference(Reference),
    Map(Map),
}

pub type Map = BTreeMap<String, Type>;

#[derive(Clone, Debug, PartialEq)]
pub struct Callback {
    pub arguments: Vec<Type>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Component {
    pub properties: Map,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Reference {
    pub path: Vec<String>,
}
