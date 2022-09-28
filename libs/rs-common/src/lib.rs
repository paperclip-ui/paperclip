#![feature(type_alias_impl_trait)]
#![feature(trait_alias)]

pub mod fs;
pub mod fun;
pub mod id;
pub mod path;
pub mod event_stream;
pub mod pc;
pub mod serialize_context;
pub mod str_utils;

#[macro_use]
extern crate lazy_static;
