use crate::server::core::ServerEvent;
use anyhow::Result;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use paperclip_common::fs::{FileWatchEvent, FileWatchEventKind};

use tokio::sync::mpsc::{channel, Receiver};
use crate::server::core::ServerEngineContext;
use crate::server::io::ServerIO;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    file_watcher(ctx.clone()).await?;
    Ok(())
}
pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    Ok(())
}

async fn file_watcher<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    tokio::spawn(async move {
        let config_context = ctx.store.lock().unwrap().state.options.config_context.clone();

        // let (tx, rx) = std::sync::mpsc::channel();

        // let mut watcher = RecommendedWatcher::new(tx, Config::default()).unwrap();
        let (tx, mut rx) = channel(1);
        let mut watcher = RecommendedWatcher::new(
            move |res| {
                tx.blocking_send(res).unwrap();
            },
            Config::default(),
        ).unwrap();

        watcher.watch(config_context.directory.as_ref(), RecursiveMode::Recursive).unwrap();



        while let Some(e) = rx.recv().await {
            if let Ok(event) = e {
                for path in &event.paths {
                    let path = path.clone().into_os_string().into_string().unwrap();
                    match &event.kind {
                        notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Change,
                                &path,
                            )));
                        }
                        notify::EventKind::Create(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Create,
                                &path,
                            )));
                        }
                        notify::EventKind::Remove(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Remove,
                                &path,
                            )));
                        }
                        _ => {}
                    }
                }
            }
        }
    });

    Ok(())
}

