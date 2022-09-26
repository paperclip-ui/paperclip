// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use include_dir::{include_dir, Dir, File};
use warp::reply::{Reply, Response};
use warp::reject::{Rejection};
use warp::path::{tail, Tail};
use warp::{Filter};
use warp::any;
use hyper::Body;

use futures_util::{future};

static DESIGNER_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/dist");

pub struct StaticFile(&'static File<'static>);

impl Reply for StaticFile {
  fn into_response(self) -> Response {
    Response::new(Body::from(self.0.contents()))
  }
}

// Inspiration: https://github.com/seanmonstar/warp/blob/master/examples/returning.rs
pub fn routes() -> impl Filter<Extract = (StaticFile,), Error = Rejection> + Clone  {
  let get_static_file = any()
  .and(path_from_tail())
  .and_then(static_file_reply);


  get_static_file
}

fn path_from_tail() -> impl Filter<Extract = (String,), Error = Rejection> + Clone  {
  tail().and_then(move |tail: Tail| {
    println!("tailing from file");
    future::ready::<Result<String, Rejection>>(Ok(tail.as_str().to_string()))
  })
}


pub async fn static_file_reply(
  path: String
) -> Result<StaticFile, Rejection> {
  let resolved_path = if path == "" {
    "index.html".to_string()
  } else {
    path.to_string()
  };

  let file = DESIGNER_DIR.get_file(&resolved_path);

  if let Some(file) = file {
    return Ok(StaticFile(&file));
  } else {
    println!("File {} not found", path);
  }
  Err(warp::reject::not_found())
}