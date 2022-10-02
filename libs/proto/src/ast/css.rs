use crate::add_inner_wrapper;

include!(concat!(env!("OUT_DIR"), "/ast.css.rs"));

add_inner_wrapper!(declaration_value::Inner, DeclarationValue);
