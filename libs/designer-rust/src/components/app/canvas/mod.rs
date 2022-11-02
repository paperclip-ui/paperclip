use dominator::Dom;

use crate::types::AppMachine;
use dominator::html;
mod frames;

pub fn canvas(machine: AppMachine) -> Dom {
    html!("div", {
      .child(frames::frames(machine))
    })
}
