use futures_signals::signal::SignalExt;
use gloo::console::console;
use yew::prelude::*;

use crate::{state::AppState, types::AppMachine};
mod frame;

#[function_component]
pub fn Frames() -> Html {
    let machine = use_context::<AppMachine>().unwrap();

    html! {
        <div>
          <frame::Frame />
        </div>
    }
}
