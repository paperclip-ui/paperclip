use yew::prelude::*;
#[path = "styles.pc.rs"]
mod styles;



#[function_component]
pub fn Main() -> Html {
    html! {
        <div>
          <span>{"Hello"}</span>
        </div>
    }
}
