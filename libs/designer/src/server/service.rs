// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use futures::executor::block_on;
use futures::Stream;
use std::pin::Pin;
use tonic::{Request, Response, Status};

use paperclip_common::pc::is_paperclip_file;
use paperclip_evaluator::runtime::Runtime;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_project::{ConfigContext, Project, ProjectIO};
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{file_response, FileRequest, FileResponse, PaperclipData};
use std::sync::{Arc, Mutex, MutexGuard};
use tokio::sync::mpsc;
use async_stream::try_stream;


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
        let path = &request.into_inner().path;
        let mut s = Box::pin(project.lock().unwrap().io.watch(path));


        tokio::spawn(async move {

            while let Some(result) = s.next().await {
            }

            
            // let s = project.lock().unwrap().io.watch(path);

            // loop {
            //     s.next().await;
            // }
            // while let Some(ev) = s.next().await {

            // }

            // let send = |data: file_response::Data| async {

            //     tx.send(Ok(FileResponse {
            //         raw_content: vec![],
            //         data: Some(data),
            //     }))
            //     .await
            //     .unwrap();
            // };

            // if is_paperclip_file(&path) {
                
            //     let eval = || async {

            //         let mut project = project.lock().unwrap();
            //         let mut runtime = Runtime::new();

            //         block_on(project.load_file(path));
            //         let graph = project.graph.lock().unwrap();
            //         let (css, html) = block_on(runtime.evaluate(path, &graph, &project.io)).unwrap();

            //         // let s = project.io.watch(path)
            //         send(file_response::Data::Paperclip(PaperclipData {
            //             css: Some(css),
            //             html: Some(html),
            //         }));
            //     };

            //     eval().await;

            //     let mut project = project.lock().unwrap();
            //     let s = project.io.watch(path);
            //     pin_mut!(s);
            //     try_stream! {
            //         while let Some(value) = s.next().await {
            //             println!("CHANGE {:?}", value);
            //         }
            //     }

            // }

        });

        Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    }
}
