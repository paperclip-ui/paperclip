// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use futures::executor::block_on;
use futures::Stream;
use std::pin::Pin;
use tonic::{Request, Response, Status};

use paperclip_common::pc::is_paperclip_file;
use paperclip_evaluator::runtime::Runtime;
use paperclip_project::{ConfigContext, Project, ProjectIO};
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{file_response, FileRequest, FileResponse, PaperclipData};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use tokio_stream::wrappers::ReceiverStream;

type OpenFileResult<T> = Result<Response<T>, Status>;
type ResponseStream = Pin<Box<dyn Stream<Item = Result<FileResponse, Status>> + Send>>;

#[derive(Clone)]
pub struct DesignerService<IO: ProjectIO> {
    project: Arc<Mutex<Project<IO>>>,
}

impl<IO: ProjectIO> DesignerService<IO> {
    pub fn new(config_context: ConfigContext, io: IO) -> Self {
        Self {
            project: Arc::new(Mutex::new(Project::new(config_context, io))),
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
        let (tx, rx) = mpsc::channel(4);

        let project = self.project.clone();

        tokio::spawn(async move {
            let path = &request.into_inner().path;

            let mut data = None;

            if is_paperclip_file(&path) {
                let mut project = project.lock().unwrap();
                let mut runtime = Runtime::new();
                block_on(project.load_file(path));
                let graph = project.graph.lock().unwrap();
                let (css, html) = block_on(runtime.evaluate(path, &graph, &project.io)).unwrap();

                data = Some(file_response::Data::Paperclip(PaperclipData {
                    css: Some(css),
                    html: Some(html),
                }))
            }

            tx.send(Ok(FileResponse {
                raw_content: vec![],
                data,
            }))
            .await
            .unwrap();
        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}
