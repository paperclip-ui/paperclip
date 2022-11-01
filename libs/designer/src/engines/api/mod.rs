use crate::events::AppEvent;
use crate::shared::machine::core::{Dispatcher, Engine, EngineDispatcher};
use crate::state::AppState;
use futures::stream::StreamExt;
use futures_signals::signal::Mutable;
use futures_signals::signal::SignalExt;
use grpc_web_client::Client;
use paperclip_proto::service::designer::designer_client::DesignerClient;
use paperclip_proto::service::designer::{FileRequest, FileResponse};
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;
use tonic::Streaming;
use wasm_bindgen_futures::spawn_local;

#[derive(Clone)]
struct APIEngineState {
    url: Option<String>,
}

pub struct APIEngine {
    dispatcher: Rc<EngineDispatcher<AppEvent>>,
    client: Rc<RefCell<DesignerClient<Client>>>,
    state: Mutable<APIEngineState>,
}

impl APIEngine {
    pub fn new(dispatcher: Rc<EngineDispatcher<AppEvent>>) -> Self {
        let designer_client: DesignerClient<Client> = designer_client();

        APIEngine {
            dispatcher,
            client: Rc::new(RefCell::new(designer_client)),
            state: Mutable::new(APIEngineState { url: None }),
        }
    }
}

fn designer_client() -> DesignerClient<Client> {
    let wasm_client: Client = Client::new("http://localhost:8000".to_string());
    DesignerClient::new(wasm_client)
}

impl APIEngine {
    fn sync_open_file(self: Arc<Self>) {
        let mut url = self.state.signal_ref(|state| state.url.clone()).to_stream();

        let this = self.clone();
        spawn_local(async move {
            while let Some(option) = url.next().await {
                if let Some(path) = option {
                    let mut stream = self.open_file(&path).await;

                    while let Ok(Some(item)) = stream.message().await {
                        if this.as_ref().state.lock_ref().url != Some(path.clone()) {
                            break;
                        }
                        this.dispatcher.dispatch(AppEvent::FileLoaded(item));
                    }
                }
            }
        });
    }

    async fn open_file(&self, path: &String) -> Streaming<FileResponse> {
        self.client
            .as_ref()
            .borrow_mut()
            .open_file(FileRequest {
                path: path.to_string(),
            })
            .await
            .unwrap()
            .into_inner()
    }
}

impl Engine<AppEvent, AppState> for APIEngine {
    fn start(self: Arc<Self>) {
        self.sync_open_file();
    }
    fn on_event(&self, event: &AppEvent, new_state: &AppState, _old_state: &AppState) {
        match event {
            AppEvent::LocationChanged(_) => {
                let mut state = self.state.lock_mut();
                state.url = new_state.current_file.clone();
            }
            _ => {}
        }
    }
}
