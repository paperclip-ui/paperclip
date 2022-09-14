use paperclip_common::fs::{FileReader, FileResolver};

pub trait IO: Sync + Send + FileReader + FileResolver {
}
