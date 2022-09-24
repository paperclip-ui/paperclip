use crate::add_wrapper;
use std::string::ToString;

include!(concat!(env!("OUT_DIR"), "/virt.html.rs"));


add_wrapper!(node::Value, Node);


impl ToString for Node {
  fn to_string(&self) -> String {
      "[Node]".to_string()
  }
}