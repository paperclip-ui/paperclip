use paperclip_proto::ast;

enum NewNode {
    Element(ast::pc::Element),
    Text(ast::pc::TextNode),
}

// pub fn insert_node(document: &mut ast::pc::Document, parent_id: &str, new_node: NewNode) {

// }
