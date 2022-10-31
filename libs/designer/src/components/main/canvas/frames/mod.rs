use futures_signals::signal::SignalExt;
use gloo::console::console;
use yew::prelude::*;

use crate::types::AppMachine;
mod frame;

#[function_component]
pub fn Frames() -> Html {
    let machine = use_context::<AppMachine>().unwrap();
    use_effect(move || {
      machine.get_state().signal_cloned().for_each(|value| {
        console!("CHANGE".to_string());
        async {}
      });
      || {
      }
    });

    html! {
        <div>
          <frame::Frame />
        </div>
    }
}
