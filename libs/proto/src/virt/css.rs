use crate::add_inner_wrapper;

include!(concat!(env!("OUT_DIR"), "/virt.css.rs"));

add_inner_wrapper!(rule::Inner, Rule);
