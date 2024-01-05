// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use super::utils::create_design_file;
use crate::server::core::{ServerEngineContext, ServerEvent, ServerStore};
use crate::server::domains::paperclip::utils::apply_mutations;
use crate::server::io::ServerIO;
use futures::Stream;
use paperclip_ast_serialize::pc::serialize;
use paperclip_common::fs::{FSItemKind, FileWatchEventKind};
use paperclip_common::log::log_verbose;
use paperclip_language_services::DocumentInfo;
use paperclip_proto::ast::base::Range;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::pc::document_body_item;
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{
    design_server_event, file_response, ApplyMutationsRequest, ApplyMutationsResult,
    CreateDesignFileRequest, CreateDesignFileResponse, CreateFileRequest, DeleteFileRequest,
    DesignServerEvent, Empty, FileChanged, FileChangedKind, FileRequest, FileResponse, FsItem,
    ModulesEvaluated, MoveFileRequest, OpenCodeEditorRequest, OpenFileInNavigatorRequest,
    ProjectInfo, ReadDirectoryRequest, ReadDirectoryResponse, Resource, ResourceFiles,
    ResourceKind, SaveFileRequest, ScreenshotCaptured, SearchResourcesRequest,
    SearchResourcesResponse, UpdateFileRequest,
};
use path_absolutize::*;
use run_script::ScriptOptions;
use std::fs::File;
use std::io::Write;
use std::path::Path;
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
        let path: String = request.get_ref().path.clone();

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
            Err(Status::not_found(format!(
                "Dependency \"{}\" not found",
                path
            )))
        }
    }

    async fn search_resources(
        &self,
        request: Request<SearchResourcesRequest>,
    ) -> Result<Response<SearchResourcesResponse>, Status> {
        let query = request.get_ref().query.clone();
        let store = self.ctx.store.clone();
        let state = &store.lock().unwrap().state;
        let project_dir = &state.options.config_context.directory;

        // match path or file name
        let pat = format!(
            "{{{}/**/*{}*,{}/**/*{}*/**/*}}",
            project_dir, query, project_dir, query
        );

        log_verbose(&format!("Search {}", pat));

        let mut items: Vec<Resource> = vec![];

        find_resources(&query, &state.graph, &mut items);
        find_files(project_dir, &query, &mut items);

        Ok(Response::new(SearchResourcesResponse {
            root_dir: project_dir.clone(),
            items,
        }))
    }
    async fn save_file(
        &self,
        request: Request<SaveFileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let path = request.get_ref().path.clone();
        let content = request.get_ref().content.clone();

        log_verbose(format!("Saving file {}", path).as_str());

        let mut file = File::create(path)?;
        file.write_all(&content)?;

        Ok(Response::new(Empty {}))
    }

    async fn open_code_editor(
        &self,
        request: Request<OpenCodeEditorRequest>,
    ) -> Result<Response<Empty>, Status> {
        let code_editor_command_template = self
            .ctx
            .store
            .lock()
            .unwrap()
            .state
            .options
            .config_context
            .config
            .open_code_editor_command_template
            .clone();

        let code_editor_command_template = if let Some(command) = code_editor_command_template {
            command
        } else {
            return Err(Status::unknown("No code editor command provided"));
        };

        let path: String = request.get_ref().path.clone();
        let range: Option<Range> = request.get_ref().range.clone();

        let command = if let Some(range) = range {
            let start = range.start.as_ref().expect("Stat must exist");
            code_editor_command_template
                .replace("<file>", &path)
                .replace("<line>", &start.line.to_string())
                .replace("<column>", &start.column.to_string())
                .to_string()
        } else {
            code_editor_command_template
                .replace("<file>", &path)
                .replace(":<line>", "")
                .replace(":<column>", "")
                .to_string()
        };

        log_verbose(&format!("Opening code editor with \"{}\"", command));

        let (_, output, error) = run_script::run(&command, &vec![], &ScriptOptions::new()).unwrap();

        log_verbose(&format!("Output: {}", output));
        log_verbose(&format!("Error: {}", error));

        Ok(Response::new(Empty {}))
    }
    async fn get_project_info(
        &self,
        _request: Request<Empty>,
    ) -> Result<Response<ProjectInfo>, Status> {
        let config_context = &self.ctx.store.lock().unwrap().state.options.config_context;

        let experimental_capabilities =
            config_context.config.experimental.clone().unwrap_or(vec![]);
        let src_directory = config_context.get_src_dir().to_str().unwrap().to_string();

        Ok(Response::new(ProjectInfo {
            experimental_capabilities,
            src_directory,
        }))
    }

    async fn read_directory(
        &self,
        request: Request<ReadDirectoryRequest>,
    ) -> Result<Response<ReadDirectoryResponse>, Status> {
        let mut path: String = request.get_ref().path.clone();
        let store = self.ctx.store.clone();
        let project_dir = &store.lock().unwrap().state.options.config_context.directory;

        if path.get(0..1) != Some("/") {
            path = Path::new(project_dir)
                .join(path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string();
        }

        // prohibit reading outside of project directory
        if !path.contains(project_dir) {
            return Err(Status::not_found(
                "Cannot ready directory outside of project",
            ));
        }

        if let Ok(items) = self.ctx.io.read_directory(&path) {
            Ok(Response::new(ReadDirectoryResponse {
                path: path.to_string(),
                items: items
                    .iter()
                    .map(|item| FsItem {
                        kind: if matches!(item.kind, FSItemKind::Directory) {
                            0
                        } else {
                            1
                        },
                        path: item.path.to_string(),
                    })
                    .collect(),
            }))
        } else {
            Err(Status::not_found("Not implemented yet"))
        }
    }

    async fn delete_file(
        &self,
        request: Request<DeleteFileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let path: String = request.get_ref().path.clone();

        // Moves to trash
        let result = trash::delete(&path);

        if result.is_ok() {
            Ok(Response::new(Empty {}))
        } else {
            Err(Status::unknown("Cannot delete file"))
        }
    }

    async fn move_file(
        &self,
        request: Request<MoveFileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let from_path: String = request.get_ref().from_path.clone();
        let to_path: String = request.get_ref().to_path.clone();

        log_verbose(&format!("mv {} {}", from_path, to_path));

        let result = std::fs::rename(&from_path, &to_path);

        // save after mutation
        self.ctx
            .store
            .lock()
            .unwrap()
            .emit(ServerEvent::FileMoved { from_path, to_path });

        if result.is_ok() {
            Ok(Response::new(Empty {}))
        } else {
            Err(Status::unknown("Cannot move file"))
        }
    }

    async fn open_file_in_navigator(
        &self,
        request: Request<OpenFileInNavigatorRequest>,
    ) -> Result<Response<Empty>, Status> {
        let file_path: String = request.get_ref().file_path.clone();

        log_verbose(&format!("open {}", file_path));

        let result = open::that(&file_path);

        if result.is_ok() {
            Ok(Response::new(Empty {}))
        } else {
            Err(Status::unknown("Cannot open file"))
        }
    }

    async fn create_file(
        &self,
        request: Request<CreateFileRequest>,
    ) -> Result<Response<Empty>, Status> {
        let path: String = request.get_ref().path.clone();
        let kind: i32 = request.get_ref().kind;

        let result = if kind == 0 {
            log_verbose(&format!("create dir: {}", path));
            self.ctx.io.create_directory(&path)
        } else {
            log_verbose(&format!("create file: {}", path));
            self.ctx.io.write_file(&path, "".to_string())
        };

        if result.is_ok() {
            Ok(Response::new(Empty {}))
        } else {
            Err(Status::unknown("Cannot create file"))
        }
    }

    async fn get_resource_files(
        &self,
        _request: Request<Empty>,
    ) -> Result<Response<Self::GetResourceFilesStream>, Status> {
        let (tx, rx) = mpsc::channel(999);
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
                tx.send((get_files_response)(store.clone())).await.expect("get_resource_files ERR!");
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
        if let Ok(file_path) = create_design_file(
            &request.get_ref().name.to_string(),
            request.get_ref().parent_dir.clone(),
            self.ctx.clone(),
        ) {
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

        let (tx, rx) = mpsc::channel(999);

        tokio::spawn(async move {
            let graph = store.lock().unwrap().state.graph.clone();
            tx.send(Result::Ok(graph))
                .await
                .expect("get_graph err: Can't send graph");
            handle_store_events!(store.clone(),
                ServerEvent::DependencyGraphLoaded { graph } => {
                    tx.send(Result::Ok(
                        graph.clone()
                    )).await.expect("get_graph err: Can't send after dependency graph loaded");
                },
                ServerEvent::MutationsApplied { result: _, updated_graph: _ } | ServerEvent::UndoRequested | ServerEvent::RedoRequested => {
                    let graph = store.clone().lock().unwrap().state.graph.clone();

                    // TODO - need to pick out files that have changed
                    tx.send(Result::Ok(
                        graph
                    )).await.expect("get_graph err: Can't send after mutations applied");
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

        let (tx, rx) = mpsc::channel(999);

        tokio::spawn(async move {
            let file_changed = |path: String, content: Vec<u8>| {
                Result::Ok(
                    design_server_event::Inner::FileChanged(FileChanged {
                        kind: FileChangedKind::Content.into(),
                        path: path.to_string(),
                        content: Some(content.clone()),
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
                    )).await.expect("Can't send (ScreenshotCaptured)");
                },
                ServerEvent::UpdateFileRequested { path, content } => {
                    tx.send((file_changed)(path.to_string(), content.clone())).await.expect("on_event err: Can't send after update file");
                },
                ServerEvent::FileWatchEvent(event) => {
                    log_verbose(&format!("Sending file change {}:{:?}", event.path, event.kind));
                    match event.kind {
                        FileWatchEventKind::Create => {
                            tx.send(Result::Ok(design_server_event::Inner::FileChanged(FileChanged {
                                kind: FileChangedKind::Created.into(),
                                path: event.path.to_string(),
                                content: None
                            })
                            .get_outer())).await.expect("Can't send");
                        },
                        FileWatchEventKind::Remove => {
                            tx.send(Result::Ok(design_server_event::Inner::FileChanged(FileChanged {
                                    kind: FileChangedKind::Deleted.into(),
                                    path: event.path.to_string(),
                                    content: None
                                })
                                .get_outer())).await.expect("Can't send");

                        },
                        _ => {

                        }
                    }
                },
                ServerEvent::ModulesEvaluated(map) => {
                    tx.send(Ok(design_server_event::Inner::ModulesEvaluated(ModulesEvaluated {
                        file_paths: map.keys().map(|key| {
                            key.to_string()
                        }).collect()
                    })
                    .get_outer())).await.expect("on_event ERR!");
                },
                ServerEvent::MutationsApplied { result: _, updated_graph: _ } | ServerEvent::UndoRequested | ServerEvent::RedoRequested => {
                    let updated_files = store.lock().unwrap().state.updated_files.clone();
                    let file_cache = store.lock().unwrap().state.file_cache.clone();
                    for file_path in &updated_files {
                        if let Some(content) = file_cache.get(file_path) {
                            tx.send((file_changed)(file_path.to_string(), content.clone())).await.expect("on_event err: Can't send afer mutations aplpied");
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

fn find_files(dir: &str, pattern: &str, found: &mut Vec<Resource>) {
    for entry in std::fs::read_dir(dir).expect("Can't read dir") {
        let entry = entry.expect("Can't read entry");
        let is_dir = entry.metadata().expect("Can't get metadata").is_dir();

        let path = entry
            .path()
            .as_os_str()
            .to_str()
            .expect("Can't convert")
            .to_string();

        if is_dir {
            find_files(&path, pattern, found);
        } else {
            if matches_search_pattern(&path, &pattern) {
                let parts = Path::new(&path);

                found.push(Resource {
                    kind: ResourceKind::File2.into(),
                    id: path.to_string(),
                    parent_path: parts.parent().unwrap().to_str().unwrap().to_string(),
                    name: parts.file_name().unwrap().to_str().unwrap().to_string(),
                });
            }
        }
    }
}

fn find_resources(pattern: &str, graph: &Graph, found: &mut Vec<Resource>) {
    for (path, dep) in &graph.dependencies {
        let doc = dep.document.as_ref().expect("Document must exist");
        for item in &doc.body {
            let name = if let Some(name) = item.get_name() {
                name
            } else {
                continue;
            };

            if !matches_search_pattern(
                format!("{}{}", path, &name).to_lowercase().as_str(),
                pattern,
            ) {
                continue;
            }

            let kind = match item.get_inner() {
                document_body_item::Inner::Component(_) => ResourceKind::Component,
                document_body_item::Inner::Atom(_) => ResourceKind::Token,
                document_body_item::Inner::Style(_) => ResourceKind::StyleMixin,
                _ => {
                    continue;
                }
            };

            found.push(Resource {
                parent_path: path.to_string(),
                kind: kind.into(),
                name: name.to_string(),
                id: item.get_id().to_string(),
            });
        }
    }
}

fn matches_search_pattern(value: &str, pattern: &str) -> bool {
    let value = value.to_lowercase();
    let pattern = pattern.to_lowercase();
    // println!("{}", pattern);
    // value.contains(pattern.as_str())
    pattern.split(" ").all(|part| value.contains(part))
}
