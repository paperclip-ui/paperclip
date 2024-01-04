use crate::server::core::ServerEvent;
use anyhow::Result;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use paperclip_common::fs::{FileWatchEvent, FileWatchEventKind};
use paperclip_common::log::log_verbose;

use crate::server::core::ServerEngineContext;
use crate::server::io::ServerIO;
use tokio::sync::mpsc::channel;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    file_watcher(ctx.clone()).await?;
    Ok(())
}
pub async fn start<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    handle_global_scripts(ctx.clone()).await?;
    Ok(())
}

async fn file_watcher<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    tokio::spawn(async move {
        let config_context = ctx
            .store
            .lock()
            .unwrap()
            .state
            .options
            .config_context
            .clone();

        let (tx, mut rx) = channel(1);
        let mut watcher = RecommendedWatcher::new(
            move |res| {
                tx.blocking_send(res).unwrap();
            },
            Config::default(),
        )
        .unwrap();

        log_verbose(&format!("watching {:?}", config_context.directory));

        watcher
            .watch(config_context.directory.as_ref(), RecursiveMode::Recursive)
            .unwrap();

        while let Some(e) = rx.recv().await {
            if let Ok(event) = e {
                log_verbose(&format!("File event: {:?}", event));
                for path in &event.paths {
                    let path_str = path.clone().into_os_string().into_string().unwrap();
                    match &event.kind {
                        notify::EventKind::Modify(notify::event::ModifyKind::Data(_)) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Change,
                                &path_str,
                            )));
                        }
                        notify::EventKind::Create(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Create,
                                &path_str,
                            )));
                        }
                        notify::EventKind::Remove(_) => {
                            ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                FileWatchEventKind::Remove,
                                &path_str,
                            )));
                        }
                        notify::EventKind::Modify(_) => {
                            // May happen when deleting directories
                            if !path.exists() {
                                ctx.emit(ServerEvent::FileWatchEvent(FileWatchEvent::new(
                                    FileWatchEventKind::Remove,
                                    &path_str,
                                )));
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    });

    Ok(())
}

async fn handle_global_scripts<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let global_script_paths = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .get_global_script_paths();

    let mut loaded_scripts: Vec<(String, Vec<u8>)> = vec![];

    for script_path in global_script_paths {
        // no remote resources
        if script_path.contains("://") {
            continue;
        }
        loaded_scripts.push((
            script_path.to_string(),
            ctx.io.read_file(&script_path)?.into_vec(),
        ));
    }

    ctx.emit(ServerEvent::GlobalScriptsLoaded(loaded_scripts));

    handle_store_events!(ctx.store.clone(), ServerEvent::FileWatchEvent(event) => {
        if ctx.store.lock().unwrap().state.options.config_context.get_global_script_paths().contains(&event.path) {
            ctx.emit(ServerEvent::GlobalScriptsLoaded(vec![(
                event.path.clone(),
                ctx.io.read_file(&event.path).expect("Unable to load file").into_vec()
            )]));
        }

    });

    Ok(())
}
