use crate::{add_inner_wrapper};

include!(concat!(env!("OUT_DIR"), "/ast_mutate.rs"));


add_inner_wrapper!(mutation::Inner, Mutation);
