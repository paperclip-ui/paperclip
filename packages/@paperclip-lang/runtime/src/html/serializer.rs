use super::virt;
use super::utils::{is_void_tag};
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
            }
            virt::NodeChild::TextNode(element) => {
                serialize_text_node(element, context);
            }
        }
    }
}
fn serialize_element(element: &virt::Element, context: &mut Context) {
    context.add_buffer(format!("<{}", element.tag_name).as_str());
    for attr in &element.attributes {
        context.add_buffer(format!(" {}=\"{}\"", attr.name, attr.value).as_str());
    }
    context.add_buffer(">\n");
    if is_void_tag(&element.tag_name) {
        return;
    }
    context.start_block();
    serialize_children(&element.children, context);
    context.end_block();
    context.add_buffer(format!("</{}>\n", element.tag_name).as_str());
}
fn serialize_text_node(text_node: &virt::TextNode, context: &mut Context) {
    context.add_buffer(text_node.value.as_str());
    context.add_buffer("\n");
}
