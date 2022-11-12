// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use crate::server::core::{ServerEvent, ServerStore};
use futures::Stream;
use paperclip_editor::Mutation;
use paperclip_language_services::DocumentInfo;
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{
    file_response, Empty, FileRequest, FileResponse, InsertNodeRequest, UpdateFileRequest, ApplyMutationsRequest,
};
use std::pin::Pin;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::sync::mpsc;
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
                let data = if let Ok(module) =
                    store.lock().unwrap().state.bundle_evaluated_module(&path)
                {
                    Some(file_response::Data::Paperclip(module))
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

        self.store
            .lock()
            .unwrap()
            .emit(ServerEvent::UpdateFileRequested { path, content });
        Ok(Response::new(Empty {}))
    }

    async fn apply_mutations(&self, request: Request<ApplyMutationsRequest>) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();

        self.store
            .lock()
            .unwrap()
            .emit(ServerEvent::ApplyMutationRequested { mutations: request.mutations });
        Ok(Response::new(Empty {}))
    }

    async fn insert_node(
        &self,
        request: Request<InsertNodeRequest>,
    ) -> Result<Response<Empty>, Status> {
        Ok(Response::new(Empty {}))
    }

    async fn get_document_info(
        &self,
        request: Request<FileRequest>,
    ) -> Result<Response<DocumentInfo>, Status> {
        let inner = request.into_inner();

        let state = &self.store.lock().unwrap().state;

        if let Some(dep) = state.graph.dependencies.get(&inner.path) {
            return Ok(Response::new(
                paperclip_language_services::get_document_info(&dep.path, &state.graph)
                    .expect("Unable to get document info"),
            ));
        }

        Err(Status::invalid_argument("File does not exist"))
    }
}
