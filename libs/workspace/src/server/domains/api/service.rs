// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use super::utils::{apply_mutations, create_design_file};
use crate::server::core::{ServerEngineContext, ServerEvent, ServerStore};
use crate::server::io::ServerIO;
use futures::Stream;
use paperclip_ast_serialize::pc::serialize;
use paperclip_language_services::DocumentInfo;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{
    design_server_event, file_response, ApplyMutationsRequest, ApplyMutationsResult,
    CreateDesignFileRequest, CreateDesignFileResponse, DesignServerEvent, Empty, FileChanged,
    FileRequest, FileResponse, ModulesEvaluated, ResourceFiles, ScreenshotCaptured,
    UpdateFileRequest,
};
use std::pin::Pin;
use std::sync::Arc;
use std::sync::Mutex;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};

type DesignServerEventStream =
    Pin<Box<dyn Stream<Item = Result<DesignServerEvent, Status>> + Send>>;
type ResourceFilesStream = Pin<Box<dyn Stream<Item = Result<ResourceFiles, Status>> + Send>>;
type GetGraphStream = Pin<Box<dyn Stream<Item = Result<Graph, Status>> + Send>>;

#[derive(Clone)]
pub struct DesignerService<TIO: ServerIO> {
    ctx: ServerEngineContext<TIO>,
}

impl<TIO: ServerIO> DesignerService<TIO> {
    pub fn new(ctx: ServerEngineContext<TIO>) -> Self {
        Self { ctx }
    }
}

#[tonic::async_trait]
impl<TIO: ServerIO> Designer for DesignerService<TIO> {
    type OnEventStream = DesignServerEventStream;
    type GetResourceFilesStream = ResourceFilesStream;
    type GetGraphStream = GetGraphStream;

    async fn open_file(
        &self,
        request: Request<FileRequest>,
    ) -> Result<Response<FileResponse>, Status> {
        let store = self.ctx.store.lock().unwrap();
        let path = request.get_ref().path.clone();

        let data = if let Ok(module) = store.state.bundle_evaluated_module(&path) {
            Some(file_response::Data::Paperclip(module))
        } else {
            None
        };

        if let Some(dependency) = store.state.graph.dependencies.get(&path) {
            Ok(Response::new(FileResponse {
                raw_content: serialize(dependency.document.as_ref().expect("Document must exist"))
                    .as_bytes()
                    .to_vec(),
                data,
            }))
        } else {
            Err(Status::not_found("Dependency not found"))
        }
    }

    async fn get_resource_files(
        &self,
        _request: Request<Empty>,
    ) -> Result<Response<Self::GetResourceFilesStream>, Status> {
        let (tx, rx) = mpsc::channel(128);
        let output = ReceiverStream::new(rx);

        let store = self.ctx.store.clone();

        tokio::spawn(async move {
            let get_files_response = |store: Arc<Mutex<ServerStore>>| {
                let file_paths = store
                    .lock()
                    .unwrap()
                    .state
                    .graph
                    .dependencies
                    .keys()
                    .map(|key| key.to_string())
                    .collect::<Vec<String>>();

                Ok(ResourceFiles { file_paths })
            };

            tx.send((get_files_response)(store.clone()))
                .await
                .expect("Failed to send stream, must be closed");

            handle_store_events!(store.clone(), ServerEvent::DependencyGraphLoaded { graph: _ } => {
                tx.send((get_files_response)(store.clone())).await.expect("Failed to send stream, must be closed");
            });
        });

        Ok(Response::new(
            Box::pin(output) as Self::GetResourceFilesStream
        ))
    }

    async fn create_design_file(
        &self,
        request: Request<CreateDesignFileRequest>,
    ) -> Result<Response<CreateDesignFileResponse>, Status> {
        if let Ok(file_path) =
            create_design_file(&request.get_ref().name.to_string(), self.ctx.clone())
        {
            Ok(Response::new(CreateDesignFileResponse { file_path }))
        } else {
            Err(Status::already_exists("File already exists"))
        }
    }

    async fn undo(&self, _request: Request<Empty>) -> Result<Response<Empty>, Status> {
        self.ctx
            .store
            .lock()
            .unwrap()
            .emit(ServerEvent::UndoRequested {});

        Ok(Response::new(Empty {}))
    }

    async fn redo(&self, _request: Request<Empty>) -> Result<Response<Empty>, Status> {
        self.ctx
            .store
            .lock()
            .unwrap()
            .emit(ServerEvent::RedoRequested {});
        Ok(Response::new(Empty {}))
    }

    async fn save(&self, _request: Request<Empty>) -> Result<Response<Empty>, Status> {
        self.ctx
            .store
            .lock()
            .unwrap()
            .emit(ServerEvent::SaveRequested {});
        Ok(Response::new(Empty {}))
    }

    async fn get_graph(
        &self,
        _request: Request<Empty>,
    ) -> Result<Response<Self::GetGraphStream>, Status> {
        let store = self.ctx.store.clone();

        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            let graph = store.lock().unwrap().state.graph.clone();
            tx.send(Result::Ok(graph)).await.expect("Can't send");
            handle_store_events!(store.clone(),
                ServerEvent::DependencyGraphLoaded { graph } => {
                    tx.send(Result::Ok(
                        graph.clone()
                    )).await.expect("Can't send");
                },
                ServerEvent::MutationsApplied { result: _, updated_graph: _ } => {
                    let graph = store.clone().lock().unwrap().state.graph.clone();

                    // TODO - need to pick out files that have changed
                    tx.send(Result::Ok(
                        graph
                    )).await.expect("Can't send");
                }
            );
        });

        let output = ReceiverStream::new(rx);

        Ok(Response::new(Box::pin(output) as Self::GetGraphStream))
    }

    async fn on_event(
        &self,
        _request: Request<Empty>,
    ) -> Result<Response<Self::OnEventStream>, Status> {
        let store = self.ctx.store.clone();

        let (tx, rx) = mpsc::channel(128);

        tokio::spawn(async move {
            let file_changed = |path: String, content: Vec<u8>| {
                Result::Ok(
                    design_server_event::Inner::FileChanged(FileChanged {
                        path: path.to_string(),
                        content: content.clone(),
                    })
                    .get_outer(),
                )
            };

            handle_store_events!(store.clone(),
                ServerEvent::ScreenshotCaptured { expr_id } => {
                    tx.send(Result::Ok(
                        design_server_event::Inner::ScreenshotCaptured(ScreenshotCaptured {
                            expr_id: expr_id.to_string()
                        })
                        .get_outer(),
                    )).await.expect("Can't send");
                },
                ServerEvent::UpdateFileRequested { path, content } => {
                    tx.send((file_changed)(path.to_string(), content.clone())).await.expect("Can't send");
                },
                ServerEvent::ModulesEvaluated(map) => {
                    tx.send(Ok(design_server_event::Inner::ModulesEvaluated(ModulesEvaluated {
                        file_paths: map.keys().map(|key| {
                            key.to_string()
                        }).collect()
                    })
                    .get_outer())).await.expect("Can't send changes");
                },
                ServerEvent::MutationsApplied { result: _, updated_graph: _ } | ServerEvent::UndoRequested | ServerEvent::RedoRequested => {

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

        self.ctx
            .store
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
        if let Ok(changes) = apply_mutations(&request.mutations, self.ctx.clone()).await {
            Ok(Response::new(ApplyMutationsResult { changes }))
        } else {
            Err(Status::unknown("Cannot apply mutations"))
        }
    }

    async fn get_document_info(
        &self,
        request: Request<FileRequest>,
    ) -> Result<Response<DocumentInfo>, Status> {
        let inner = request.into_inner();

        let state = &self.ctx.store.lock().unwrap().state;

        if let Some(dep) = state.graph.dependencies.get(&inner.path) {
            return Ok(Response::new(
                paperclip_language_services::get_document_info(&dep.path, &state.graph)
                    .expect("Unable to get document info"),
            ));
        }

        Err(Status::invalid_argument("File does not exist"))
    }
}
