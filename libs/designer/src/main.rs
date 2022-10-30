mod components;
mod engines;
mod events;
mod shared;
mod state;

use yew::prelude::*;

#[function_component]
fn App() -> Html {
    html! {
        <components::main::Main />
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {}

#[cfg(target_arch = "wasm32")]
fn main() {
    use engines::api::APIEngine;
    use gloo::console::console;
    use shared::machine::core::Machine;
    use state::AppState;

    let state = AppState::default();
    let machine = Machine::new(state, APIEngine::new);
    yew::Renderer::<App>::new().render();
}
