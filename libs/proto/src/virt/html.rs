use crate::add_inner_wrapper;
use std::string::ToString;

include!(concat!(env!("OUT_DIR"), "/virt.html.rs"));

add_inner_wrapper!(node::Inner, Node);

impl ToString for Node {
    fn to_string(&self) -> String {
        "[Node]".to_string()
    }
}

impl Node {
    pub fn get_metadata(&self) -> &Option<NodeMedata> {
        match self.get_inner() {
            node::Inner::Element(element) => {
                &element.metadata
            }
            node::Inner::TextNode(text) => {
                &text.metadata
            }
        }
    }
}