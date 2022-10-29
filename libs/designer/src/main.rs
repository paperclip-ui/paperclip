
mod components;
mod engines;
mod shared;
mod state;
mod events;

use gloo::console::console;
use yew::prelude::*;
use shared::machine::core::Machine;
use engines::api::APIEngine;
use state::AppState;

#[function_component]
fn App() -> Html {
    html! {
        <components::main::Main />
    }
}

fn main() {
    let state = AppState::default();
    let machine = Machine::new(state, APIEngine::new);
    yew::Renderer::<App>::new().render();
    console!("bbdd".to_string());
}
