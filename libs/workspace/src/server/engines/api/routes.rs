// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use headers::{AcceptRanges, ContentLength, ContentType, HeaderMapExt};
use hyper::Body;
use include_dir::{include_dir, Dir, File};
use warp::any;
use warp::path::{tail, Tail};
use warp::reject::Rejection;
use warp::reply::{Reply, Response};
use warp::Filter;

use futures_util::future;

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

// Inspiration: https://github.com/seanmonstar/warp/blob/master/examples/returning.rs
pub fn routes() -> impl Filter<Extract = (StaticFile,), Error = Rejection> + Clone {
    let get_static_file = any().and(path_from_tail()).and_then(static_file_reply);

    get_static_file
}

fn path_from_tail() -> impl Filter<Extract = (String,), Error = Rejection> + Clone {
    tail().and_then(move |tail: Tail| {
        future::ready::<Result<String, Rejection>>(Ok(tail.as_str().to_string()))
    })
}

pub async fn static_file_reply(path: String) -> Result<StaticFile, Rejection> {
    let resolved_path = if path == "" {
        "index.html".to_string()
    } else {
        path.to_string()
    };

    println!("{}", env!("CARGO_MANIFEST_DIR"));

    let file = DESIGNER_DIR.get_file(&resolved_path);

    if let Some(file) = file {
        return Ok(StaticFile(resolved_path, &file));
    } else {
        println!("File {} not found", path);
    }
    Err(warp::reject::not_found())
}
