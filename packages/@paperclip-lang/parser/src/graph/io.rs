use futures::future::{select_all, BoxFuture, Future, FutureExt};
use paperclip_common::fs::{FileReader, FileResolver};

pub trait IO: Sync + Send + FileReader + FileResolver {
    // fn resolve(&self, from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>>;
    // fn read(&self, path: &String) -> BoxFuture<'static, Option<String>>;
}
