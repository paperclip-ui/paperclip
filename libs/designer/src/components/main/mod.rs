use gloo::console::console;
use yew::prelude::*;
#[path = "styles.pc.rs"]
mod styles;

#[function_component]
pub fn Main() -> Html {
    html! {
        <styles::Test on_click={|_| {
          console!("IT WORKS!".to_string());
        }}>
          <span class={1}>{"Hello"}</span>
        </styles::Test>
    }
}


