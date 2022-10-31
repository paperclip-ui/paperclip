use yew::prelude::*;
mod frames;

#[function_component]
pub fn Canvas() -> Html {
    html! {
        <div>
          <frames::Frames />
        </div>
    }
}
