#![feature(type_alias_impl_trait)]
#![feature(trait_alias)]
#![feature(inherent_associated_types)]
pub mod config;
pub mod project;
mod project_compiler;
pub mod project_io;
mod target_compiler;
mod watch_local;

#[cfg(test)]
pub mod tests;
