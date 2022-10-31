mod components;
mod engines;
mod events;
mod shared;
mod types;
mod state;
use std::sync::Arc;

use engines::{api::APIEngine, history::HistoryEngine, logger::LoggerEngine};
use events::AppEvent;
use shared::machine::core::{Dispatcher, GroupEngine, Machine};
use state::AppState;
use types::AppMachine;

use yew::prelude::*;
use yew::{use_state};

#[function_component]
fn App() -> Html {
    let machine = use_state(|| {
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
        machine
    });
    html! {
        <yew::ContextProvider<AppMachine> context={(*machine).clone()}>
            <components::main::Main />
        </yew::ContextProvider<AppMachine>>
    }
}

fn main() {


    yew::Renderer::<App>::new().render();
}
