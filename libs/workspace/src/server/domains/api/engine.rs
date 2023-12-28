// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
use super::res_body::EitherBody;
use super::routes;
use super::service::DesignerService;
use super::utils::content_types;
use crate::server::core::{ServerEngineContext, ServerEvent};

use crate::server::io::ServerIO;
use anyhow::Result;
use futures::future::{self, Either, TryFutureExt};
use hyper::{service::make_service_fn, service::service_fn, Server};
use paperclip_common::log::notice;
use paperclip_proto::service::designer::designer_server::DesignerServer;
use std::convert::Infallible;
use tower::Service;
use warp::Filter;

type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

pub async fn prepare<TIO: ServerIO>(_ctx: ServerEngineContext<TIO>) -> Result<()> {
    Ok(())
}

pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    start_server(ctx.clone()).await?;
    Ok(())
}

async fn start_server<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let port = if let Some(port) = ctx.store.lock().unwrap().state.options.port {
        port
    } else {
        portpicker::pick_unused_port().expect("No ports free")
    };

    let addr = ([127, 0, 0, 1], port).into();

    notice(&format!("🎨 Starting design server on port {}", port));

    let designer = DesignerService::new(ctx.clone());
    let designer_server = DesignerServer::new(designer);
    let designer_server = tonic_web::enable(designer_server);

    let server = Server::bind(&addr).serve(make_service_fn(move |_| {
        let cors = warp::cors().allow_any_origin();
        let route = routes::screenshots_route()
            .or(routes::static_files_route())
            .with(cors);

        let mut warp = warp::service(route);
        let mut designer_server = designer_server.clone();
        future::ok::<_, Infallible>(service_fn(move |req: hyper::Request<hyper::Body>| {
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
        }))
    }));

    ctx.emit(ServerEvent::APIServerStarted { port });

    server.await?;

    Ok(())
}
