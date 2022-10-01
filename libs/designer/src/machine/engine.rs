use parking_lot::{Mutex, MutexGuard};

use super::store::Store;
use std::sync::Arc;

pub struct EngineContext<TState, TEvent, TIO: Sized> {
    pub store: Arc<Mutex<Store<TState, TEvent>>>,
    pub io: TIO,
}

impl<TState, TEvent, TIO: Sized> EngineContext<TState, TEvent, TIO> {
    pub fn new(store: Arc<Mutex<Store<TState, TEvent>>>, io: TIO) -> Self {
        Self { store, io }
    }

    pub fn lock_store(&self) -> MutexGuard<'_, Store<TState, TEvent>> {
        self.store.lock()
    }

    pub fn emit(&self, event: TEvent) {
        self.store.lock().emit(event);
    }
}
