
mod components;
mod engines;
mod shared;
mod state;
mod events;

use yew::prelude::*;

#[function_component]
fn App() -> Html {
    html! {
        <components::main::Main />
    }
}

#[cfg(not(target_arch = "wasm32"))]
fn main() {
    
}

#[cfg(target_arch = "wasm32")]
fn main() {
    use gloo::console::console;
    use shared::machine::core::Machine;
    use state::AppState;
    use engines::api::APIEngine;

    let state = AppState::default();
    let machine = Machine::new(state, APIEngine::new);
    yew::Renderer::<App>::new().render();
}
