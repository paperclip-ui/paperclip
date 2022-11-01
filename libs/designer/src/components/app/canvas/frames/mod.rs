use dominator::Dom;
mod frame;

use crate::types::AppMachine;
use dominator::html;
use futures_signals::signal::SignalExt;

pub fn frames(machine: AppMachine) -> Dom {
  let frames = machine.state.signal_ref(|state| {
    state.current_module.clone()
  }).map(|module| {
    if let Some(module) = module {
      if let Some(document) = &module.html {
        return document.children.clone()
      }
    }

    return vec![];
  }).map(move|children| {
    children.into_iter().map(|child| {
      frame::frame(child, machine.clone())
    }).collect()
  }).to_signal_vec();


    html!("div", {
      .children_signal_vec(frames)
    })
}
