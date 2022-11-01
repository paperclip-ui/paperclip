mod components;
mod engines;
mod events;
mod shared;
mod state;
mod types;
use std::sync::Arc;

use dominator::{append_dom, get_id};
use engines::{api::APIEngine, history::HistoryEngine, logger::LoggerEngine};
use shared::machine::core::{GroupEngine, Machine};
use state::AppState;

fn main() {
    let machine = Machine::new(AppState::default(), |dispatcher| {
        Arc::new(GroupEngine::new(
            dispatcher,
            vec![
                Box::new(|dispatcher| Arc::new(APIEngine::new(dispatcher))),
                Box::new(|dispatcher| Arc::new(HistoryEngine::new(dispatcher))),
                Box::new(|_dispatcher| Arc::new(LoggerEngine {})),
            ],
        ))
    });

    machine.start();

    append_dom(&get_id("app"), components::app::app(machine));
}
