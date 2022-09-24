// mod state;
mod state2;
#[macro_use]
pub mod visit;
pub use state2::*;
include!(concat!(env!("OUT_DIR"), "/base.ast.rs"));
