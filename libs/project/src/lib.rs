// #![feature(type_alias_impl_trait)]
// #![feature(trait_alias)]
// #![feature(impl_trait_in_assoc_type)]

pub mod io;
pub mod project;
mod project_compiler;
mod target_compiler;
mod utils;
pub use io::*;
pub use project::*;

#[cfg(test)]
pub mod tests;
