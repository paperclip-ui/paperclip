use gloo::console::console;

use crate::{events::AppEvent, shared::machine::core::Engine, state::AppState};

pub struct LoggerEngine;

impl Engine<AppEvent, AppState> for LoggerEngine {
    fn on_event(&self, event: &AppEvent, _new_state: &AppState, _old_state: &AppState) {
        console!(format!("Event: {:?}", event));
    }
}
