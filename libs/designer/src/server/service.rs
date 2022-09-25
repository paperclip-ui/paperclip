// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use async_stream::try_stream;
use futures::executor::block_on;
use futures::Stream;
use futures_util::pin_mut;
use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt,
};
use futures_util::stream::StreamExt;
use std::path::Path;
use paperclip_common::pc::is_paperclip_file;
use paperclip_evaluator::runtime::Runtime;
use paperclip_project::{ConfigContext, Project, ProjectIO};
use paperclip_proto::service::designer::designer_server::Designer;
use paperclip_proto::service::designer::{file_response, FileRequest, FileResponse, PaperclipData};
use std::pin::Pin;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::sync::{Arc, Mutex, MutexGuard};
use std::time::Duration;
use tokio::sync::mpsc;
use tokio::time::timeout;
use tonic::{Request, Response, Status};

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

        let project = self.project.clone();
        let (mut watcher, mut rx) = async_watcher().unwrap();
        let output = try_stream! {
            let path = request.into_inner().path;
            watcher.watch(Path::new(&path), RecursiveMode::Recursive).unwrap();

            loop {
                let data = if is_paperclip_file(&path) {
                    Some(evaluate_pc_data(&path, project.clone()))
                } else {
                    None
                };

                yield FileResponse {
                    raw_content: vec![],
                    data
                };

                rx.next().await;

            }
        };

        // pin_mut!(output);

        Ok(Response::new(Box::pin(output)))
    }
}


pub fn async_watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (mut tx, rx) = channel(1);

    // Automatically select the best implementation for your platform.
    // You can also access each implementation directly e.g. INotifyWatcher.
    let watcher = RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        Config::default(),
    )?;

    Ok((watcher, rx))
}

fn evaluate_pc_data<IO: ProjectIO + 'static>(path: &str, project: Arc<Mutex<Project<IO>>>) -> file_response::Data {
    let mut project = project.lock().unwrap();

    let mut runtime = Runtime::new();

    block_on(project.load_file(path));
    let graph = project.graph.lock().unwrap();
    let (css, html) = block_on(runtime.evaluate(path, &graph, &project.io)).unwrap();
    file_response::Data::Paperclip(PaperclipData {
        css: Some(css),
        html: Some(html),
    })
}