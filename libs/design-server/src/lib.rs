mod server;
pub use server::*;
// use tonic::{transport::Server, Request, Response, Status};

// use hello_world::greeter_server::{Greeter, GreeterServer};
// use hello_world::{HelloReply, HelloRequest};

// pub mod hello_world {
//     tonic::include_proto!("designer");
// }

// #[derive(Default)]
// pub struct MyGreeter {}

// #[tonic::async_trait]
// impl Greeter for MyGreeter {
//     async fn say_hello(
//         &self,
//         request: Request<HelloRequest>,
//     ) -> Result<Response<HelloReply>, Status> {
//         println!("Got a request from {:?}", request.remote_addr());

//         let reply = hello_world::HelloReply {
//             message: format!("Hello {}!", request.into_inner().name),
//         };
//         Ok(Response::new(reply))
//     }
// }

// pub struct StartOptions {
//    pub open: bool,
//    pub port: Option<u16>
// }

// #[tokio::main]
// pub async fn start(options: StartOptions) -> Result<(), Box<dyn std::error::Error>> {
//     let addr = "[::1]:50051".parse().unwrap();
//     let greeter = MyGreeter::default();

//     println!("GreeterServer listening on {}", addr);

//     Server::builder()
//         .add_service(GreeterServer::new(greeter))
//         .serve(addr)
//         .await?;

//     Ok(())
// }
