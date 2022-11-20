// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use crate::server::core::{ServerEvent, ServerStore};
use futures::Stream;
use paperclip_language_services::DocumentInfo;
use paperclip_parser::pc::serializer::serialize;
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{
    designer_event,
    FileChanged,
    file_response, ApplyMutationsRequest, ApplyMutationsResult, Empty, FileRequest, FileResponse,
    UpdateFileRequest, DesignerEvent,
};
use std::pin::Pin;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};

type OpenFileResult<T> = Result<Response<T>, Status>;
type FileResponseStream = Pin<Box<dyn Stream<Item = Result<FileResponse, Status>> + Send>>;
type DesignerEventStream = Pin<Box<dyn Stream<Item = Result<DesignerEvent, Status>> + Send>>;
type OnEventResult<T> = Result<Response<T>, Status>;

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
    type OpenFileStream = FileResponseStream;
    type OnEventStream = DesignerEventStream;
    async fn open_file(
        &self,
        request: Request<FileRequest>,
    ) -> OpenFileResult<Self::OpenFileStream> {
        let store = self.store.clone();

        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            let path = request.into_inner().path;
            println!("Opening file: {}", path);

            let emit = |path: String, store: Arc<Mutex<ServerStore>>| {
                let data = if let Ok(module) =
                    store.lock().unwrap().state.bundle_evaluated_module(&path)
                {
                    Some(file_response::Data::Paperclip(module))
                } else {
                    None
                };

                Ok(FileResponse {
                    raw_content: serialize(
                        &store
                            .lock()
                            .unwrap()
                            .state
                            .graph
                            .dependencies
                            .get(&path)
                            .expect("Dependency doesn't exist!")
                            .document,
                    )
                    .as_bytes()
                    .to_vec(),
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

    async fn on_event(&self, _request: Request<Empty>) ->OnEventResult<Self::OnEventStream>  {
        let store = self.store.clone();

        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {

            let file_changed = |path: String, content: Vec<u8>| {
                Result::Ok(designer_event::Inner::FileChanged(FileChanged {
                    path: path.to_string(),
                    content: content.clone()
                }).get_outer())
            };

            handle_store_events!(store.clone(),
                ServerEvent::UpdateFileRequested { path, content } => {
                    tx.send((file_changed)(path.to_string(), content.clone())).await.expect("Can't send");
                },
                ServerEvent::ApplyMutationRequested { mutations: _mutations } => {
                    let updated_files = store.lock().unwrap().state.updated_files.clone();
                    let file_cache = store.lock().unwrap().state.file_cache.clone();

                    for file_path in &updated_files {
                        if let Some(content) = file_cache.get(file_path) {
                            tx.send((file_changed)(file_path.to_string(), content.clone())).await.expect("Can't send");
                        }
                    }
                }
            );
        });

        let output = ReceiverStream::new(rx);

        Ok(Response::new(Box::pin(output) as Self::OnEventStream))

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

    async fn apply_mutations(
        &self,
        request: Request<ApplyMutationsRequest>,
    ) -> Result<Response<ApplyMutationsResult>, Status> {
        let request = request.into_inner();

        self.store
            .lock()
            .unwrap()
            .emit(ServerEvent::ApplyMutationRequested {
                mutations: request.mutations,
            });

        Ok(Response::new(ApplyMutationsResult {
            changes: self.store.lock().unwrap().state.latest_ast_changes.clone(),
        }))
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
