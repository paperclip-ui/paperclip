pub struct EventBus<T> {
    channels: Vec<crossbeam_channel::Sender<T>>,
}

impl<T: Clone + Send + Sync> EventBus<T> {
    pub fn subscribe<'listener>(&mut self) -> crossbeam_channel::Receiver<T> {
        let (tx, rx) = crossbeam_channel::unbounded();
        self.channels.push(tx);
        rx
    }
    pub fn emit(&self, message: T) {
        for c in &self.channels {
            c.send(message.clone());
        }
    }

    pub fn new() -> Self {
        Self { channels: vec![] }
    }
}
