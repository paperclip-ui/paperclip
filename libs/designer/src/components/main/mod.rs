use gloo::console::console;
use yew::prelude::*;

#[function_component]
pub fn Main() -> Html {
    html! {
        <div onclick={|_| {
          console!("IT WORKS!".to_string());
        }}>
          <span class={1}>{"Hello"}</span>
        </div>
    }
}
