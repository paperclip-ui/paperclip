use anyhow::{Error, Result};
use paperclip_proto::ast;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use std::collections::BTreeMap;

#[derive(Clone, Debug, PartialEq)]
pub enum Type {
    Unknown,
    String,
    Slot,
    Number,
    Boolean,
    Enum(Vec<Type>),
    ExactString(String),
    Array(Box<Type>),
    Optional(Box<Type>),
    Callback(Callback),
    Element(Element),
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
    pub fn add_enum(&self, typee: Type) -> Type {
        if let Type::Enum(types) = self {
            let mut new_types = vec![typee];
            new_types.extend(types.clone());
            Type::Enum(new_types)
        } else {
            Type::Enum(vec![typee])
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct MapProp {
    pub prop_type: Type,
    pub optional: bool,
}
pub type Map = BTreeMap<String, MapProp>;

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

#[derive(Clone, Debug, PartialEq)]
pub struct Element {
    pub id: String,
    pub tag_name: String,
    pub namespace: Option<String>,
}

impl Element {
    pub fn get_instance_dep<'a>(&self, source: &str, graph: &'a Graph) -> Option<&'a Dependency> {
        let dep = graph.dependencies.get(source)?;
        if let Some(ns) = &self.namespace {
            dep.resolve_import_from_ns(ns, graph)
        } else {
            Some(dep)
        }
    }

    pub fn get_instance_component<'a>(
        &self,
        source: &str,
        graph: &'a Graph,
    ) -> Option<&'a ast::pc::Component> {
        self.get_instance_dep(source, graph)?
            .document
            .as_ref()?
            .get_component_by_name(&self.tag_name)
    }
}
