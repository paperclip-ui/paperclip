use paperclip_proto::service::designer::designer_client::DesignerClient;
use crate::events::AppEvent;
use crate::state::AppState;
use crate::shared::machine::core::{Engine, EngineDispatcher};

pub struct APIEngine {
  dispatcher: EngineDispatcher<AppEvent>
}

impl APIEngine {
  pub fn new(dispatcher: EngineDispatcher<AppEvent>) -> Self {
    APIEngine { dispatcher }
  }
}


impl Engine<AppEvent, AppState> for APIEngine {  
  fn on_event(&self, event: &AppEvent, new_state: &AppState, old_state: &AppState) {
      println!("DO FOR IT");
  }
}