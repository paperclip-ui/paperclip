use async_stream::try_stream;
use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt,
};
use futures_core::stream::Stream;
use futures_util::stream::StreamExt;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;

pub fn async_watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (mut tx, rx) = channel(1);

    // Automatically select the best implementation for your platform.
    // You can also access each implementation directly e.g. INotifyWatcher.
    let watcher = RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        Config::default(),
    )?;

    Ok((watcher, rx))
}

pub fn async_watch<P: AsRef<Path>>(path: P) -> impl Stream<Item = notify::Result<Event>> {
    try_stream! {
        let (mut watcher, mut rx) = async_watcher()?;
        watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;
      while let Some(res) = rx.next().await {
          match res {
              Ok(event) => {
                yield event;
              },
              Err(e) => println!("watch error: {:?}", e),
          }
      }
    }
}
