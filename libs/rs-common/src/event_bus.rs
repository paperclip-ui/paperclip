use std::sync::Arc;

pub struct EventBus<T> {
    channels: Vec<crossbeam_channel::Sender<Arc<T>>>,
}

impl<T> EventBus<T> {
    pub fn subscribe<'listener>(&mut self) -> crossbeam_channel::Receiver<Arc<T>> {
        let (tx, rx) = crossbeam_channel::unbounded();
        self.channels.push(tx);
        rx
    }
    pub fn emit(&self, message: T) {
        let message = Arc::new(message);
        for c in &self.channels {
            c.send(message.clone());
        }
    }

    pub fn new() -> Self {
        Self { channels: vec![] }
    }
}
