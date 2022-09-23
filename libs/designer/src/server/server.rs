// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
use futures::future::{self, Either, TryFutureExt};
use http::version::Version;
use hyper::{service::make_service_fn, Server};
use std::convert::Infallible;
use std::env;
use super::proto as designer;
use super::service::DesignerService;
use tower::Service;

use designer::designer_server::{DesignerServer};
use super::res_body::{EitherBody};
type Error = Box<dyn std::error::Error + Send + Sync + 'static>;



pub struct StartOptions {
    pub open: bool,
    pub port: Option<u16>,
}

#[tokio::main]
pub async fn start(_options: StartOptions) -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50051".parse().unwrap();
    println!("{:?}", get_designer_path());

    let designer = DesignerService {};
    let tonic = DesignerServer::new(designer);

    Server::bind(&addr)
        .serve(make_service_fn(move |_| {
            let mut warp = warp::service(warp::fs::dir(get_designer_path()));
            let mut tonic = tonic.clone();
            future::ok::<_, Infallible>(tower::service_fn(
                move |req: hyper::Request<hyper::Body>| match req.version() {
                    Version::HTTP_11 | Version::HTTP_10 => Either::Left(
                        warp.call(req)
                            .map_ok(|res| res.map(EitherBody::Left))
                            .map_err(Error::from),
                    ),
                    Version::HTTP_2 => Either::Right(
                        tonic
                            .call(req)
                            .map_ok(|res| res.map(EitherBody::Right))
                            .map_err(Error::from),
                    ),
                    _ => unimplemented!(),
                },
            ))
        }))
        .await?;

    Ok(())
}

fn get_designer_path() -> String {
    format!("{}/dist", env!("CARGO_MANIFEST_DIR"))
}
