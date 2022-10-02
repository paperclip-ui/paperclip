use std::sync::Arc;

use paperclip_common::event_bus::{EventBus, Receiver};

pub trait EventHandler<TState, TEvent: Clone>: Clone {
    fn handle_event(&self, state: &mut TState, event: &TEvent);
}

pub struct Store<TState, TEvent: Clone, TEventHandler: EventHandler<TState, TEvent>> {
    events: EventBus<TEvent>,
    pub state: TState,
    event_handler: TEventHandler,
}

impl<TState, TEvent: Clone, TEventHandler: EventHandler<TState, TEvent>>
    Store<TState, TEvent, TEventHandler>
{
    pub fn new(state: TState, event_handler: TEventHandler) -> Self {
        Self {
            events: EventBus::new(),
            state,
            event_handler,
        }
    }
    pub fn emit(&mut self, event: TEvent) {
        self.event_handler
            .clone()
            .handle_event(&mut self.state, &event);
        self.events.emit(event);
    }
    pub fn subscribe(&mut self) -> Receiver<Arc<TEvent>> {
        self.events.subscribe()
    }
}
