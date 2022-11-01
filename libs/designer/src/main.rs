mod components;
mod engines;
mod events;
mod shared;
mod state;
mod types;
use std::sync::Arc;

use dominator::{append_dom, get_id, html, Dom};
use engines::{api::APIEngine, history::HistoryEngine, logger::LoggerEngine};
use shared::machine::core::{GroupEngine, Machine};
use state::AppState;
use types::AppMachine;

struct App {
    machine: AppMachine,
}

impl App {
    fn render(&self) -> Dom {
        let machine = self.machine.clone();

        html!("div", {
            .attr("id", "something")
            .text_signal(machine.state.signal_ref(|state| {
                if let Some(file) = state.current_file.clone() {
                    file.clone()
                } else {
                    "nothing loaded".to_string()
                }
            }))
            .children([
                components::common::iframe_portal(move || {
                    vec![
                    html!("div", {
                        .text_signal(machine.state.signal_ref(|state| {
                            if let Some(file) = state.current_file.clone() {
                                file.clone()
                            } else {
                                "nothing loaded".to_string()
                            }
                        }))
                    })
                ]
                })
            ])
        })
    }
}

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

    let app = App { machine };

    append_dom(&get_id("app"), app.render());
}
