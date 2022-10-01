use crate::server::core::ServerEvent;
use anyhow::Result;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use paperclip_common::fs::{FileWatchEvent, FileWatchEventKind};
use std::path::Path;

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

        let (tx, rx) = std::sync::mpsc::channel();

        let mut watcher = RecommendedWatcher::new(tx, Config::default()).unwrap();

        watcher
            .watch(
                Path::new(&config_context.directory),
                RecursiveMode::Recursive,
            )
            .unwrap();

        for e in rx {
            if let Ok(event) = e {
                for path in &event.paths {
                    let path = path.clone().into_os_string().into_string().unwrap();
                    match &event.kind {
                        notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Change,
                                &path,
                            )))
                            ;
                        }
                        notify::EventKind::Create(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Create,
                                &path,
                            )))
                            ;
                        }
                        notify::EventKind::Remove(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Remove,
                                &path,
                            )))
                            ;
                        }
                        _ => {}
                    }
                }
            }
        }
    });

    Ok(())
}
