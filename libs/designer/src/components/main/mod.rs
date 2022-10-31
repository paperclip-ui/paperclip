use gloo::console::console;
use yew::prelude::*;
mod canvas;

#[function_component]
pub fn Main() -> Html {
    html! {
        <div onclick={|_| {
          console!("IT WORKS!".to_string());
        }}>
          <canvas::Canvas />
        </div>
    }
}
