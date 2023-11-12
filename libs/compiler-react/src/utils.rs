use paperclip_proto::ast;
use paperclip_proto::ast::all::*;

pub const COMPILER_NAME: &str = "react";

pub fn node_contains_script(node: &ast::pc::Node) -> bool {
    match node.get_inner() {
        ast::pc::node::Inner::Element(expr) => contains_script(&expr.body),
        ast::pc::node::Inner::Text(expr) => contains_script(&expr.body),
        _ => false,
    }
}

pub fn contains_script(body: &Vec<ast::pc::Node>) -> bool {
    body.iter()
        .find(|child| {
            if let ast::pc::node::Inner::Script(script) = child.get_inner() {
                script.get_target() == Some(String::from(COMPILER_NAME))
            } else {
                false
            }
        })
        .is_some()
}

pub fn get_node_name(node: &ast::pc::Node) -> String {
    let name = match node.get_inner() {
        ast::pc::node::Inner::Element(expr) => expr.name.clone(),
        ast::pc::node::Inner::Text(expr) => expr.name.clone(),
        _ => None,
    };
    name.unwrap_or(node.get_id().to_string())
}
