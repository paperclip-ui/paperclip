use parking_lot::{Mutex, MutexGuard};

use super::store::{EventHandler, Store};
use std::sync::Arc;

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

    pub fn lock_store(&self) -> MutexGuard<'_, Store<TState, TEvent, TEventHandler>> {
        self.store.lock()
    }

    pub fn emit(&self, event: TEvent) {
        self.store.lock().emit(event);
    }
}
