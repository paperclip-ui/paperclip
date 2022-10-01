use std::sync::Arc;

use paperclip_common::event_bus::EventBus;

pub struct Store<TState, TEvent> {
    events: EventBus<TEvent>,
    pub state: TState,
}

impl<TState, TEvent> Store<TState, TEvent> {
    pub fn new(state: TState) -> Self {
        Self {
            events: EventBus::new(),
            state,
        }
    }
    pub fn emit(&self, event: TEvent) {
        self.events.emit(event)
    }
    pub fn subscribe(&mut self) -> crossbeam_channel::Receiver<Arc<TEvent>> {
        self.events.subscribe()
    }
}
