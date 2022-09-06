use super::config::Config;
use anyhow::Result;
use futures::future::{BoxFuture, FutureExt};
use glob::glob;
use paperclip_parser::graph::graph::Graph;
use paperclip_parser::graph::io::IO as GraphIO;
use path_absolutize::*;
use std::fs;
use std::path::Path;

pub struct ProjectGraphIO {}

impl GraphIO for ProjectGraphIO {
    fn resolve(&self, from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>> {
        let ret: Option<String> = Some(String::from(
            Path::new(from_path)
                .parent()
                .unwrap()
                .join(to_path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap(),
        ));

        async { ret }.boxed()
    }
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>> {
        let ret = if let Ok(content) = fs::read_to_string(path) {
            Some(content.to_string())
        } else {
            None
        };

        async { ret }.boxed()
    }
}
