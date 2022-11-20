use paperclip_proto::ast::pc;

mod base;
mod merge;
pub use base::*;
pub use merge::*;

#[cfg(test)]
pub mod test;
