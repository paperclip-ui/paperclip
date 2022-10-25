use anyhow::{Error, Result};
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

impl Type {
    pub fn into_component(&self) -> Result<Component> {
        if let Type::Component(component) = &self {
            return Ok(component.clone());
        }
        return Err(Error::msg("root type isn't a component"));
    }

    pub fn into_map(&self) -> Result<Map> {
        if let Type::Map(map) = &self {
            return Ok(map.clone());
        }
        return Err(Error::msg("root type isn't a component"));
    }
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
