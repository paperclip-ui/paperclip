use yew::prelude::*;
mod components;
mod lib::machine;
mod state;

#[function_component]
fn App() -> Html {
    html! {
        <components::main::Main />
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
