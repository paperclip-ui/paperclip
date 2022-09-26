// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
use super::service::DesignerService;
use super::utils::content_types;
use futures::future::{self, Either, TryFutureExt};
use hyper::{service::make_service_fn, Server};
use open;
use paperclip_project::{ConfigContext, ProjectIO};
use std::convert::Infallible;
use std::env;
use tower::Service;
use warp::Filter;

use super::res_body::EitherBody;
use paperclip_proto::service::designer::designer_server::DesignerServer;
type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

pub struct StartOptions<IO: ProjectIO> {
    pub config_context: ConfigContext,
    pub project_io: IO,
    pub open: bool,
    pub port: Option<u16>,
}

#[tokio::main]
pub async fn start<IO: ProjectIO + 'static>(
    options: StartOptions<IO>,
) -> Result<(), Box<dyn std::error::Error>> {
    let port = if let Some(port) = options.port {
        port
    } else {
        portpicker::pick_unused_port().expect("No ports free")
    };

    let addr = format!("[::1]:{}", port).parse().unwrap();

    println!("🎨 Starting design server on port {}", port);

    let designer = DesignerService::new(options.config_context.clone(), options.project_io.clone());
    let designer_server = DesignerServer::new(designer);
    let designer_server = tonic_web::config().enable(designer_server);

    let server = Server::bind(&addr).serve(make_service_fn(move |_| {

        let cors = warp::cors()
            .allow_any_origin();

        let route = warp::fs::dir(get_designer_path()).with(cors);
        

        let mut warp = warp::service(route);
        let mut designer_server = designer_server.clone();
        future::ok::<_, Infallible>(tower::service_fn(
            move |req: hyper::Request<hyper::Body>| {
                if content_types::is_grpc_web(req.headers()) {
                    Either::Left(
                        designer_server
                            .call(req)
                            .map_ok(|res| res.map(EitherBody::Left))
                            .map_err(Error::from),
                    )
                } else {
                    Either::Right(
                        warp.call(req)
                            .map_ok(|res| res.map(EitherBody::Right))
                            .map_err(Error::from),
                    )
                }
            },
        ))
    }));

    if options.open {
        open::that(format!("http://localhost:{}", port)).unwrap();
    }

    server.await?;

    Ok(())
}

fn get_designer_path() -> String {
    format!("{}/dist", env!("CARGO_MANIFEST_DIR"))
}
