// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use headers::{AcceptRanges, ContentLength, ContentType, HeaderMapExt};
use hyper::Body;
use include_dir::{include_dir, Dir, File};
use paperclip_common::log::log_warning;
use warp::any;
use warp::path::{tail, Tail};
use warp::reject::Rejection;
use warp::reply::{Reply, Response};
use warp::Filter;

use futures_util::future;

use crate::server::core::utils::tmp_screenshot_dir;

static DESIGNER_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../designer/dist");

pub struct StaticFile(String, &'static File<'static>);

impl Reply for StaticFile {
    fn into_response(self) -> Response {
        let mime = mime_guess::from_path(&self.0).first_or_octet_stream();

        let mut resp = Response::new(Body::from(self.1.contents()));

        resp.headers_mut()
            .typed_insert(ContentLength(self.1.contents().len() as u64));
        resp.headers_mut().typed_insert(ContentType::from(mime));
        resp.headers_mut().typed_insert(AcceptRanges::bytes());
        resp
    }
}

pub fn screenshots_route() -> impl Filter<Extract = (warp::fs::File,), Error = Rejection> + Clone {
    warp::path("screenshots").and(warp::fs::dir(tmp_screenshot_dir()))
}
pub fn assets_route(
    cwd: String,
) -> impl Filter<Extract = (warp::fs::File,), Error = Rejection> + Clone {
    warp::path("assets").and(warp::fs::dir(cwd))
}

pub fn static_files_route() -> impl Filter<Extract = (StaticFile,), Error = Rejection> + Clone {
    any().and(path_from_tail()).and_then(static_file_reply)
}

pub async fn static_file_reply(path: String) -> Result<StaticFile, Rejection> {
    let resolved_path = if path == "" {
        "index.html".to_string()
    } else {
        path.to_string()
    };

    let file = DESIGNER_DIR.get_file(&resolved_path);

    if let Some(file) = file {
        return Ok(StaticFile(resolved_path, &file));
    } else {
        log_warning(&format!("Static file {} not found", path));
    }
    Err(warp::reject::not_found())
}

fn path_from_tail() -> impl Filter<Extract = (String,), Error = Rejection> + Clone {
    tail().and_then(move |tail: Tail| {
        future::ready::<Result<String, Rejection>>(Ok(tail.as_str().to_string()))
    })
}
