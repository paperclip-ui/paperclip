use yew::prelude::*;
#[path = "styles.pc.rs"]
mod styles;

#[function_component]
pub fn Main() -> Html {
    html! {
        <styles::Test>
          <span class={1}>{"Hello"}</span>
        </styles::Test>
    }
}
