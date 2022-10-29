use std::default::Default;

use crate::{shared::machine::core::Reducer, events::AppEvent};

#[derive(Default, Clone)]
pub struct AppState {

}

impl Reducer<AppEvent> for AppState {
  fn reduce(&self, event: &AppEvent) -> Self {
      self.clone()
  }
}