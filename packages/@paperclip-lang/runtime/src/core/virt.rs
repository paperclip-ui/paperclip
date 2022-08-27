// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
use crate::html::virt::Node;
use serde::Serialize;
use std::collections::BTreeMap;
use std::string::ToString;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Array {
    pub source_id: Option<String>,
    pub items: Vec<Value>,
}

impl ToString for Array {
    fn to_string(&self) -> String {
        "[Object object]".to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Object {
    pub source_id: Option<String>,
    pub properties: Vec<ObjectProperty>,
}

impl Object {
    pub fn extend(&mut self, other: &mut Object) {
        let mut combined = self.to_map();
        combined.extend(other.to_map());
        self.properties = vec![];
        for (_, property) in combined {
            self.properties.push(property);
        }
    }
    fn to_map(&mut self) -> BTreeMap<String, ObjectProperty>{
        let mut map = BTreeMap::new();
        for item in self.properties.drain(..) {
            map.insert(item.name.to_string(), item);
        }
        map
    }
    pub fn get(&mut self, name: &str) -> Option<&Value> {
        if let Some(property) = self.properties.iter().find(|prop| prop.name == name) {
            Some(&property.value)
        } else {
            None
        }
    }
}

impl ToString for Object {
    fn to_string(&self) -> String {
        "[Object object]".to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct ObjectProperty {
    pub source_id: Option<String>,
    pub name: String,
    pub value: Value,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Str {
    pub source_id: Option<String>,
    pub value: String,
}

impl ToString for Str {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Number {
    pub source_id: Option<String>,
    pub value: f32,
}

impl ToString for Number {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Boolean {
    pub source_id: Option<String>,
    pub value: bool,
}

impl ToString for Boolean {
    fn to_string(&self) -> String {
        self.value.to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Undefined {
    pub source_id: Option<String>,
}

impl ToString for Undefined {
    fn to_string(&self) -> String {
        "undefined".to_string()
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum Value {
    Array(Array),
    Object(Object),
    String(Str),
    Number(Number),
    Boolean(Boolean),
    Undefined(Undefined),
    Node(Node),
}

impl ToString for Value {
    fn to_string(&self) -> String {
        match self {
            Self::Array(value) => value.to_string(),
            Self::Object(value) => value.to_string(),
            Self::String(value) => value.to_string(),
            Self::Boolean(value) => value.to_string(),
            Self::Number(value) => value.to_string(),
            Self::Undefined(value) => value.to_string(),
            Self::Node(node) => node.to_string(),
        }
    }
}
