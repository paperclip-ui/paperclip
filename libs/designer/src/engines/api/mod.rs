use gloo::console::console;
use paperclip_proto::service::designer::designer_client::DesignerClient;
use paperclip_proto::service::designer::FileRequest;
use crate::events::AppEvent;
use crate::state::AppState;
use crate::shared::machine::core::{Engine, EngineDispatcher};

use tonic_web_wasm_client::Client;

pub struct APIEngine {
  dispatcher: EngineDispatcher<AppEvent>,
  client: DesignerClient<Client>
}


impl APIEngine {
  pub fn new(dispatcher: EngineDispatcher<AppEvent>) -> Self {

    let base_url = "http://localhost:8080".to_string();
    let wasm_client: Client = Client::new(base_url);
    let mut designer_client: DesignerClient<Client> = DesignerClient::new(wasm_client);
    console!("Hello".to_string());

    designer_client.open_file(FileRequest {
      path: "/Users/crcn/Developer/private/tandem/libs/designer/src/components/main/styles.pc".to_string()
    });

    

    APIEngine { dispatcher, client: designer_client }
  }
}

impl Engine<AppEvent, AppState> for APIEngine {  
  fn on_event(&self, event: &AppEvent, new_state: &AppState, old_state: &AppState) {
      println!("DO FOR IT");
  }
}