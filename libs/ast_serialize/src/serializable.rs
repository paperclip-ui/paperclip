use paperclip_common::serialize_context::Context;
use paperclip_proto::ast::all::ExpressionWrapper;

use crate::pc::{serialize_atom, serialize_array, serialize_boolean, serialize_doc_comment2, serialize_component, serialize_element, serialize_text, serialize_slot, serialize_insert, serialize_node};


pub trait Serializable {
  fn serialize(&self) -> String;
}


impl Serializable for ExpressionWrapper {
  fn serialize(&self) -> String {
      let mut context = Context::new(0);


      match self {
          ExpressionWrapper::Ary(expr) => serialize_array(expr, &mut context),
          ExpressionWrapper::Atom(expr) => serialize_atom(expr, &mut context),
          ExpressionWrapper::Boolean(expr) => serialize_boolean(expr, &mut context),
          ExpressionWrapper::Comment(expr) => serialize_doc_comment2(expr, &mut context),
          ExpressionWrapper::Component(expr) => serialize_component(expr, &mut context),
          ExpressionWrapper::Element(expr) => serialize_element(expr, &mut context),
          ExpressionWrapper::TextNode(expr) => serialize_text(expr, &mut context),
          ExpressionWrapper::Node(expr) => serialize_node(expr, &mut context),
          ExpressionWrapper::Slot(expr) => serialize_slot(expr, &mut context),
          ExpressionWrapper::Insert(expr) => serialize_insert(expr, &mut context),
          _ => {
            panic!("Not implemented")
          }
      }

      context.buffer.to_string()
  }
}
