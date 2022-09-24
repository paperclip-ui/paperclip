// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use futures::Stream;
use std::pin::Pin;
use tonic::{Request, Response, Status};

use super::proto as designer;
use designer::designer_server::Designer;
use designer::{FileRequest, FileResponse};
use paperclip_project::{ConfigContext, Project, ProjectIO};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use tokio_stream::{wrappers::ReceiverStream, StreamExt};
// use tonic::{transport::Server, Request, Response, Status, Streaming};

type OpenFileResult<T> = Result<Response<T>, Status>;
type ResponseStream = Pin<Box<dyn Stream<Item = Result<FileResponse, Status>> + Send>>;

#[derive(Clone)]
pub struct DesignerService<IO: ProjectIO> {
    project: Arc<Mutex<Project<IO>>>,
}

impl<IO: ProjectIO> DesignerService<IO> {
    pub fn new(config_context: ConfigContext, io: IO) -> Self {
        Self {
          project: Arc::new(Mutex::new(Project::new(config_context, io)))
        }
    }
}

#[tonic::async_trait]
impl<IO: ProjectIO + 'static> Designer for DesignerService<IO> {
    type OpenFileStream = ResponseStream;
    async fn open_file(
        &self,
        request: Request<FileRequest>,
    ) -> OpenFileResult<Self::OpenFileStream> {
        let (mut tx, rx) = mpsc::channel(4);

        tokio::spawn(async move {
            println!("OK");
            tx.send(Ok(FileResponse {
                data: vec![]
            })).await.unwrap();
        });


        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}
