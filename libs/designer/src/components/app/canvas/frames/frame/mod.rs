use dominator::{Dom, html};
use paperclip_proto::virt::html::{Node, node};

use crate::types::AppMachine;


pub fn frame(frame: Node, machine: AppMachine) -> Dom {
    let metadata = frame.get_metadata();

    html!("div", {
        .text("a frame")
    })
}