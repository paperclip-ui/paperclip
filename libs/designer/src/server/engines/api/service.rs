// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use crate::server::core::{ServerEvent, ServerStore};
use futures::Stream;
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{
    file_response, Empty, FileRequest, FileResponse, PaperclipData, UpdateFileRequest,
};
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::mpsc;
use std::sync::Mutex;
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};

type OpenFileResult<T> = Result<Response<T>, Status>;
type ResponseStream = Pin<Box<dyn Stream<Item = Result<FileResponse, Status>> + Send>>;

#[derive(Clone)]
pub struct DesignerService {
    store: Arc<Mutex<ServerStore>>,
}

impl DesignerService {
    pub fn new(store: Arc<Mutex<ServerStore>>) -> Self {
        Self { store }
    }
}

#[tonic::async_trait]
impl Designer for DesignerService {
    type OpenFileStream = ResponseStream;
    async fn open_file(
        &self,
        request: Request<FileRequest>,
    ) -> OpenFileResult<Self::OpenFileStream> {
        let store = self.store.clone();

        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            let path = request.into_inner().path;

            let emit = |path: String, store: Arc<Mutex<ServerStore>>| {
                let data = if let Some(modules) = &store.lock().unwrap().state.evaluated_modules {
                    if let Some((css, html)) = modules.get(&path) {
                        Some(file_response::Data::Paperclip(PaperclipData {
                            css: Some(css.clone()),
                            html: Some(html.clone()),
                        }))
                    } else {
                        None
                    }
                } else {
                    None
                };

                Ok(FileResponse {
                    raw_content: vec![],
                    data,
                })
            };


            tx.send(emit(path.clone(), store.clone()))
                .await
                .expect("Can't send");

            handle_store_events!(store.clone(), ServerEvent::ModulesEvaluated(_) => {
                tx.send(emit(path.clone(), store.clone())).await.expect("Failed to send stream, must be closed");
            });
        });

        let output = ReceiverStream::new(rx);

        Ok(Response::new(Box::pin(output) as Self::OpenFileStream))
    }

    async fn update_file(
        &self,
        request: Request<UpdateFileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let inner = request.into_inner();

        
        let path = inner.path;
        let content = inner.content;

        self.store.lock().unwrap().emit(ServerEvent::UpdateFileRequested { path, content });
        Ok(Response::new(Empty {  }))
    }
}
