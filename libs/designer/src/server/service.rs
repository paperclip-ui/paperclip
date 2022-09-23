// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use futures::Stream;
use std::pin::Pin;
use tonic::{Request, Response, Status};

use super::proto as designer;
use designer::designer_server::Designer;
use designer::{FileRequest, FileResponse};

type OpenFileResult<T> = Result<Response<T>, Status>;
type ResponseStream = Pin<Box<dyn Stream<Item = Result<FileResponse, Status>> + Send>>;

#[derive(Default, Copy, Clone)]
pub struct DesignerService;

#[tonic::async_trait]
impl Designer for DesignerService {
    type OpenFileStream = ResponseStream;
    async fn open_file(
        &self,
        _request: Request<FileRequest>,
    ) -> OpenFileResult<Self::OpenFileStream> {
        println!("DO IT?");
        Err(Status::unimplemented("not implemented"))
    }
}
