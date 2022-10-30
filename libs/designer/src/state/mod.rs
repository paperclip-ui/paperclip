use std::default::Default;

use crate::{events::AppEvent, shared::machine::core::Reducer};

#[derive(Default, Clone)]
pub struct AppState {}

impl Reducer<AppEvent> for AppState {
    fn reduce(&self, event: &AppEvent) -> Self {
        self.clone()
    }
}
