use dominator::{Dom, html};

use crate::types::AppMachine;
mod canvas;

pub fn app(machine: AppMachine) -> Dom {
    html!("div", {
      .child(canvas::canvas(machine))
    })
}
