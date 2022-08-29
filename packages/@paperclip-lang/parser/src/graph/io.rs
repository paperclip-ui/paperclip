use futures::future::{select_all, BoxFuture, Future, FutureExt};

pub trait IO: Sync + Send {
    fn resolve(&self, from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>>;
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>>;
}
