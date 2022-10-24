use std::collections::BTreeMap;

use paperclip_parser::graph::Graph;
use paperclip_proto::ast;
use crate::state::Type;

pub fn infer_component(component_name: String, path: &str, graph: &Graph) -> Type {
  let mut map = BTreeMap::new();
  map.insert("a".to_string(), Type::Number);
  Type::Map(map)
}