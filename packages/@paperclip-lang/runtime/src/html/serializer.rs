use super::virt;
use paperclip_common::serialize_context::Context;

// TODO - properly render void tags

pub fn serialize(document: &virt::Document) -> String {
    let mut context = Context::new(0);
    serialize_children(&document.children, &mut context);
    context.buffer
}

fn serialize_children(children: &Vec<virt::NodeChild>, context: &mut Context) {
    for child in children {
      match child {
          virt::NodeChild::Element(element) => {
              serialize_element(element, context);
          },
          virt::NodeChild::TextNode(element) => {
              serialize_text_node(element, context);
          }
      }
    }
  }
  fn serialize_element(element: &virt::Element, context: &mut Context) {
    context.add_buffer(format!("<{}", element.tag_name).as_str());
    context.add_buffer(">\n");
    context.start_block();
    context.end_block();
    context.add_buffer(format!("</{}>", element.tag_name).as_str());
  }
  fn serialize_text_node(text_node: &virt::TextNode, context: &mut Context) {
    
  }