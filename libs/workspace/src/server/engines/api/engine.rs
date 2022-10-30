// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs
use super::res_body::EitherBody;
use super::routes::routes;
use super::service::DesignerService;
use super::utils::content_types;
use crate::server::core::{ServerEngineContext, ServerEvent};
use futures::StreamExt;
use hyper::server::conn::AddrIncoming;
use hyper::server::conn::Http;
use tls_listener::{TlsListener};
use std::io::BufReader;

use crate::server::io::ServerIO;
use tokio::net::{TcpListener};
use anyhow::Result;
use futures::future::{self, Either, TryFutureExt};
use hyper::{service::make_service_fn, Server, service::service_fn};
use paperclip_proto::service::designer::designer_server::DesignerServer;
use rustls::sign::{SigningKey, RSASigningKey};
use std::convert::Infallible;
use rustls_pemfile::certs;
use std::io::BufRead;
use std::sync::Arc;
use tokio_rustls::rustls::{Certificate, PrivateKey, ServerConfig};
use tokio_rustls::TlsAcceptor;
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

    // let listener = TlsListener::new_hyper(tls_acceptor(), AddrIncoming::bind(&addr)?);

    println!("🎨 Starting design server on port {}", port);


    let designer = DesignerService::new(ctx.store.clone());
    let designer_server = DesignerServer::new(designer);
    let designer_server = tonic_web::config().enable(designer_server);


    let server = Server::bind(&addr).serve(make_service_fn(move |_| {
        let cors = warp::cors().allow_any_origin();
        let route = routes().with(cors);

        let mut warp = warp::service(route);
        let mut designer_server = designer_server.clone();
        future::ok::<_, Infallible>(service_fn(
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

    ctx.emit(ServerEvent::APIServerStarted { port });

    server.await?;

    Ok(())
}

const LOCAL_CERT: &'static [u8] = include_bytes!("../../../../localhost+2.pem");
const LOCAL_PKEY: &'static [u8] = include_bytes!("../../../../localhost+2-key.pem");


fn tls_acceptor() -> TlsAcceptor {

    let mut cert = BufReader::new(LOCAL_CERT);
    let mut key = BufReader::new(LOCAL_PKEY);


    let cert_chain = certs(&mut cert)
        .unwrap()
        .iter()
        .map(|v| Certificate(v.clone()))
        .collect();

    let mut keys = rustls::PrivateKey(Vec::new()); 
    loop {
            match rustls_pemfile::read_one(&mut key).expect("cannot parse private key .pem file") {
                Some(rustls_pemfile::Item::RSAKey(key)) => keys = rustls::PrivateKey(key),
                Some(rustls_pemfile::Item::PKCS8Key(key)) => keys = rustls::PrivateKey(key),
                Some(rustls_pemfile::Item::ECKey(key)) => keys = rustls::PrivateKey(key),
                None => break,
                _ => {}
            }
        }


    Arc::new(
        ServerConfig::builder()
            .with_safe_defaults()
            .with_no_client_auth()
            .with_single_cert(cert_chain, keys)
            .unwrap(),
    )
    .into()
}


#[derive(Debug)]
struct ConnInfo {
    addr: std::net::SocketAddr,
    certificates: Vec<Certificate>,
}