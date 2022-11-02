use std::{rc::Rc, sync::Arc};

use gloo::console::console;

use crate::{
    events::AppEvent,
    shared::machine::core::{Dispatcher, Engine, EngineDispatcher},
    state::AppState,
};

pub struct HistoryEngine {
    dispatcher: Rc<EngineDispatcher<AppEvent>>,
}

impl HistoryEngine {
    pub fn new(dispatcher: Rc<EngineDispatcher<AppEvent>>) -> Self {
        Self { dispatcher }
    }

    fn emit_location_change(&self) {
        let location = web_sys::window()
            .unwrap()
            .location()
            .to_string()
            .as_string()
            .unwrap();

        self.dispatcher
            .dispatch(AppEvent::LocationChanged(location))
    }
}

impl Engine<AppEvent, AppState> for HistoryEngine {
    fn start(self: Arc<Self>) {
        self.emit_location_change();
    }
}
