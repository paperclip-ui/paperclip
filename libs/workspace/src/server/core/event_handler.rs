use std::collections::HashSet;

use super::ServerEvent;
use super::ServerState;
use crate::machine::store::EventHandler;
use paperclip_ast_serialize::pc::serialize;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::graph_ext::Graph;

enum HistoryStep {
    Forward,
    Back,
}

#[derive(Default, Clone)]
pub struct ServerStateEventHandler;

impl EventHandler<ServerState, ServerEvent> for ServerStateEventHandler {
    fn handle_event(&self, state: &mut ServerState, event: &ServerEvent) {
        match event {
            ServerEvent::DependencyGraphLoaded { graph } => {
                println!("ServerEvent::DependencyGraphLoaded");
                state.graph =
                    std::mem::replace(&mut state.graph, Graph::new()).merge(graph.clone());

                store_history(state);
            }
            ServerEvent::UpdateFileRequested { path, content } => {
                println!("ServerEvent::UpdateFileRequested");
                // onyl flag as changed if content actually changed.
                if let Some(existing_content) = state.file_cache.get(path) {
                    if content != existing_content {
                        state.updated_files.push(path.clone());
                    }
                }

                state.file_cache.insert(path.to_string(), content.clone());
            }
            ServerEvent::MutationsApplied {
                result: _result,
                updated_graph,
            } => {
                println!("ServerEvent::MutationsApplied");
                state.graph =
                    std::mem::replace(&mut state.graph, Graph::new()).merge(updated_graph.clone());

                update_changed_files(state);
                store_history(state);
            }
            ServerEvent::FileWatchEvent(event) => {
                println!("ServerEvent::FileWatchEvent");
                state.file_cache.remove(&event.path);
            }
            ServerEvent::ScreenshotsStarted => {
                println!("ServerEvent::ScreenshotsStarted");
                state.screenshot_queue = HashSet::default();
                state.screenshots_running = true;
            }
            ServerEvent::ScreenshotsFinished => {
                state.screenshots_running = false;
            }
            ServerEvent::UndoRequested => {
                println!("ServerEvent::UndoRequested");
                load_history(state, HistoryStep::Back);
            }
            ServerEvent::RedoRequested => {
                println!("ServerEvent::RedoRequested");
                load_history(state, HistoryStep::Forward);
            }
            ServerEvent::ModulesEvaluated(modules) => {
                println!("ServerEvent::ModulesEvaluated");
                state.evaluated_modules.extend(modules.clone());
                state.updated_files = vec![];
                for (path, _) in modules {
                    state.screenshot_queue.insert(path.to_string());
                }
            }
            ServerEvent::GlobalScriptsLoaded(global_scripts) => {
                println!("ServerEvent::GlobalScriptsLoaded");
                for (path, content) in global_scripts {
                    state.file_cache.insert(path.to_string(), content.clone());
                }
            }
            _ => {}
        }
    }
}

fn store_history(state: &mut ServerState) {
    if state.history.changes.is_empty() {
        state.history.changes.push(state.graph.clone());
        for (key, dep) in &state.graph.dependencies {
            state
                .doc_checksums
                .insert(key.to_string(), dep.document.as_ref().unwrap().checksum());
        }
        return;
    }

    // TODO - probably worth storing this _locally_ to avoid memory issues
    let mut updated_graph = Graph::new();
    for updated_file in &state.updated_files {
        updated_graph.dependencies.insert(
            updated_file.to_string(),
            state.graph.dependencies.get(updated_file).unwrap().clone(),
        );
        println!("Storing {} in history", updated_file);
    }
    if !state.updated_files.is_empty() {
        state.history.changes.truncate(state.history.position + 1);
        state.history.changes.push(updated_graph);
        state.history.position = state.history.changes.len() - 1;
    }
}

fn load_history(state: &mut ServerState, step: HistoryStep) {
    println!(
        "Loading history pos: {}, len: {}",
        state.history.position,
        state.history.changes.len()
    );

    state.updated_files = vec![];

    match step {
        HistoryStep::Forward => {
            if state.history.position >= state.history.changes.len() - 1 {
                return;
            }
        }
        HistoryStep::Back => {
            if state.history.position == 0 {
                return;
            }
        }
    }

    // if it doesn't exist, then we have a bug
    let current = state
        .history
        .changes
        .get(state.history.position)
        .expect("History record must exist!");

    let new_pos = match step {
        HistoryStep::Forward => state.history.position + 1,
        HistoryStep::Back => state.history.position - 1,
    };

    match step {
        HistoryStep::Forward => {
            let next = state
                .history
                .changes
                .get(new_pos)
                .expect("Next history change doesn't exist!");
            for (path, dep) in &next.dependencies {
                state
                    .graph
                    .dependencies
                    .insert(path.to_string(), dep.clone());
            }
        }
        HistoryStep::Back => {
            // revert change to most recent
            for (current_updated_path, _) in &current.dependencies {
                for i in (0..new_pos + 1).rev() {
                    let prev_change = state
                        .history
                        .changes
                        .get(i)
                        .expect("Unable to fetch dep when looking back");
                    if let Some(dep) = prev_change.dependencies.get(current_updated_path) {
                        state
                            .graph
                            .dependencies
                            .insert(current_updated_path.to_string(), dep.clone());
                        break;
                    }
                }
            }
        }
    }

    state.history.position = new_pos;

    update_changed_files(state);
}

fn update_changed_files(state: &mut ServerState) {
    for (path, dep) in &state.graph.dependencies {
        let checksum = dep.document.as_ref().unwrap().checksum();

        if !state.doc_checksums.get(path).eq(&Some(&checksum)) {
            println!("Updating {}", path);
            let content = serialize(dep.document.as_ref().expect("Document must exist"))
                .as_bytes()
                .to_vec();
            state.doc_checksums.insert(path.to_string(), checksum);
            state.updated_files.push(path.to_string());
            state.file_cache.insert(path.to_string(), content);
        }
    }
}
