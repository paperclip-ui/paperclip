use gloo::console::console;
use paperclip_proto::service::designer::designer_client::DesignerClient;
use paperclip_proto::service::designer::FileRequest;
use crate::events::AppEvent;
use crate::state::AppState;
use crate::shared::machine::core::{Engine, EngineDispatcher};
use wasm_bindgen_futures::spawn_local;

use tonic_web_wasm_client::Client;
use std::cell::RefCell;
use std::rc::Rc;

pub struct APIEngine {
  dispatcher: EngineDispatcher<AppEvent>,
  client: Rc<RefCell<DesignerClient<Client>>>
}


impl APIEngine {
  pub fn new(dispatcher: EngineDispatcher<AppEvent>) -> Self {

    let base_url = "http://localhost:8000".to_string();
    let wasm_client: Client = Client::new(base_url);
    let designer_client: DesignerClient<Client> = DesignerClient::new(wasm_client);

    let engine = APIEngine { dispatcher, client: Rc::new(RefCell::new(designer_client)) };

    engine.init();

    engine
  }
}

impl APIEngine {
  fn init(&self) {
    let client = self.client.clone();
    spawn_local(async move {
      console!("DO IT".to_string());
      let mut stream = client.borrow_mut().open_file(FileRequest {
        path: "/Users/crcn/Developer/private/tandem/libs/designer/src/components/main/styles.pc".to_string()
      }).await.unwrap().into_inner();

      println!("{:?}", "OK");

      while let Ok(Some(item)) = stream.message().await {
        println!("SOME {:?}", item);
      }
    });

    

  }
}

impl Engine<AppEvent, AppState> for APIEngine {  
  fn on_event(&self, event: &AppEvent, new_state: &AppState, old_state: &AppState) {
      println!("DO FOR IT");
  }
}