use super::store::{EventHandler, Store};
use std::sync::Arc;
use std::sync::Mutex;

pub struct EngineContext<
    TState,
    TEvent: Clone,
    TIO: Sized,
    TEventHandler: EventHandler<TState, TEvent>,
> {
    pub store: Arc<Mutex<Store<TState, TEvent, TEventHandler>>>,
    pub io: TIO,
}

impl<TState, TEvent: Clone, TIO: Sized, TEventHandler: EventHandler<TState, TEvent>>
    EngineContext<TState, TEvent, TIO, TEventHandler>
{
    pub fn new(store: Arc<Mutex<Store<TState, TEvent, TEventHandler>>>, io: TIO) -> Self {
        Self { store, io }
    }

    pub fn emit(&self, event: TEvent) {
        let mut store = self.store.lock().unwrap();
        store.emit(event);
    }
}
