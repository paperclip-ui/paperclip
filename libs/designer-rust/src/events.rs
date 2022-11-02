use paperclip_proto::service::designer::FileResponse;

#[derive(Debug)]
pub enum AppEvent {
    LocationChanged(String),
    FileLoaded(FileResponse),
}
