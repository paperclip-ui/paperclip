// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
use super::res_body::EitherBody;
use super::routes::routes;
use super::service::DesignerService;
use super::utils::content_types;
use crate::server::core::{ServerEvent, ServerStore};
use anyhow::Result;
use futures::{
    future::{self, Either, TryFutureExt},
    lock::{Mutex, MutexGuard},
};
use hyper::{service::make_service_fn, Server};
use paperclip_proto::service::designer::designer_server::DesignerServer;
use std::{convert::Infallible, sync::Arc};
use tower::Service;
use warp::Filter;
type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

pub struct APIEngine {
    store: Arc<Mutex<ServerStore>>,
}

impl APIEngine {
    pub fn new(store: Arc<Mutex<ServerStore>>) -> Self {
        Self { store }
    }

    pub async fn start(&mut self) -> Result<()> {
        self.start_server().await?;
        Ok(())
    }

    async fn start_server(&mut self) -> Result<()> {
        let store = self.store.clone();

        let port = if let Some(port) = store.lock().await.state.options.port {
            port
        } else {
            portpicker::pick_unused_port().expect("No ports free")
        };
        println!("🎨 Starting design server on port {}", port);

        let addr = ([127, 0, 0, 1], port).into();

        let designer = DesignerService::new(store.clone());
        let designer_server = DesignerServer::new(designer);
        let designer_server = tonic_web::config().enable(designer_server);

        let server = Server::bind(&addr).serve(make_service_fn(move |_| {
            println!("request made");

            let cors = warp::cors().allow_any_origin();
            let route = routes().with(cors);

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

        self.emit(ServerEvent::APIServerStarted { port }).await;

        server.await?;

        Ok(())
    }

    async fn get_store(&self) -> MutexGuard<'_, ServerStore> {
        self.store.lock().await
    }
    async fn emit(&self, event: ServerEvent) {
        self.get_store().await.events.emit(event)
    }
}
