use gloo::console::console;
use yew::prelude::*;
mod components;
mod shared;
mod state;

#[function_component]
fn App() -> Html {
    html! {
        <components::main::Main />
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
    console!("bbdd".to_string());
}
