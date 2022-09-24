use crate::add_inner_wrapper;

include!(concat!(env!("OUT_DIR"), "/ast.docco.rs"));

add_inner_wrapper!(property_value::Inner, PropertyValue);
add_inner_wrapper!(parameter_value::Inner, ParameterValue);
add_inner_wrapper!(comment_body_item::Inner, CommentBodyItem);
