use super::store::{EventHandler, Store};
use std::sync::Arc;
use std::sync::Mutex;

pub struct EngineContext<
    TState: Send + Sync + 'static,
    TEvent: Clone + Send + Sync + 'static,
    TIO: Sized + Send + Sync + 'static,
    TEventHandler: EventHandler<TState, TEvent> + Send + Sync + 'static,
> {
    pub store: Arc<Mutex<Store<TState, TEvent, TEventHandler>>>,
    pub io: TIO,
}

impl<TState: Send + Sync, TEvent: Clone + Send + Sync, TIO: Sized + Send + Sync, TEventHandler: EventHandler<TState, TEvent> + Send + Sync>
    EngineContext<TState, TEvent, TIO, TEventHandler>
{
    pub fn new(store: Arc<Mutex<Store<TState, TEvent, TEventHandler>>>, io: TIO) -> Self {
        Self { store, io }
    }

    pub fn emit(&self, event: TEvent) {
        let store = self.store.clone();
        tokio::spawn(async move {
            let mut store = store.lock().unwrap();
            store.emit(event);
        });
    }
}
