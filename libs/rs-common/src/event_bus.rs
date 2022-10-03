// Inspired by https://github.com/smol-rs/async-channel/blob/master/src/lib.rs

use anyhow::{Error, Result};
use std::ops::Drop;
use std::sync::Arc;

pub struct EventBus<T> {
    count: usize,
    channels: Vec<Sender<Arc<T>>>,
}

// crude impl that might result in deadlock. Should be cleaned up at some point

impl<T> EventBus<T> {
    pub fn subscribe<'listener>(&mut self) -> Receiver<Arc<T>> {
        let (tx, rx) = flume::unbounded();
        self.count += 1;
        self.channels.push(Sender {
            sender: tx,
            id: self.count,
        });
        Receiver {
            receiver: rx,
            fin: false,
        }
    }

    pub fn emit(&mut self, message: T) {
        // TODO - may want to throw messages in a queue in case of recursive emit
        let message = Arc::new(message);
        let mut failed = vec![];

        for c in self.channels.iter() {
            if let Err(_err) = c.send(message.clone()) {
                failed.push(c.id);
            }
        }

        self.channels
            .retain_mut(|sender| !failed.contains(&sender.id));
    }

    pub fn new() -> Self {
        Self {
            count: 0,
            channels: vec![],
        }
    }
}

pub struct Sender<T> {
    id: usize,
    sender: flume::Sender<T>,
}

impl<T> Sender<T> {
    pub fn send(&self, message: T) -> Result<(), flume::SendError<T>> {
        self.sender.send(message)
    }
}

pub struct Receiver<T> {
    fin: bool,
    receiver: flume::Receiver<T>,
}

impl<T> Receiver<T> {
    pub async fn recv(&self) -> Result<T> {
        if self.fin {
            Err(Error::msg("Received was dropped"))
        } else {
            Ok(self.receiver.recv_async().await?)
        }
    }
}

impl<T> Drop for Receiver<T> {
    fn drop(&mut self) {
        self.fin = true;
        // self.receiver.
    }
}
