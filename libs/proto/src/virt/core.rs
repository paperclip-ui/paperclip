use std::collections::BTreeMap;
use std::string::ToString;
use crate::add_inner_wrapper;

include!(concat!(env!("OUT_DIR"), "/virt.core.rs"));

add_inner_wrapper!(value::Inner, Value);

impl Object {
  pub fn extend(&mut self, other: &mut Object) {
      let mut combined = self.to_map();
      combined.extend(other.to_map());
      self.properties = vec![];
      for (_, property) in combined {
          self.properties.push(property);
      }
  }
  fn to_map(&mut self) -> BTreeMap<String, ObjectProperty> {
      let mut map = BTreeMap::new();
      for item in self.properties.drain(..) {
          map.insert(item.name.to_string(), item);
      }
      map
  }
  pub fn get(&mut self, name: &str) -> Option<&Value> {
      if let Some(property) = self.properties.iter().find(|prop| prop.name == name) {
          Some(&property.value.as_ref().expect("Value must exist"))
      } else {
          None
      }
  }
}

impl ToString for Array {
  fn to_string(&self) -> String {
      "[Object object]".to_string()
  }
}

impl ToString for Object {
  fn to_string(&self) -> String {
      "[Object object]".to_string()
  }
}


impl ToString for Str {
  fn to_string(&self) -> String {
      self.value.to_string()
  }
}


impl ToString for Number {
  fn to_string(&self) -> String {
      self.value.to_string()
  }
}

impl ToString for Boolean {
  fn to_string(&self) -> String {
      self.value.to_string()
  }
}

impl ToString for Undefined {
  fn to_string(&self) -> String {
      "undefined".to_string()
  }
}

impl ToString for Value {
  fn to_string(&self) -> String {
    self.get_inner().to_string()
  }
}

impl ToString for value::Inner {
  fn to_string(&self) -> String {
      match self {
          Self::Array(value) => value.to_string(),
          Self::Object(value) => value.to_string(),
          Self::Str(value) => value.to_string(),
          Self::Boolean(value) => value.to_string(),
          Self::Number(value) => value.to_string(),
          Self::Undef(value) => value.to_string(),
          Self::Node(node) => node.to_string(),
      }
  }
}
