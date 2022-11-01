mod components;
mod engines;
mod events;
mod shared;
mod state;
mod types;
use std::sync::Arc;

use dominator::{append_dom, clone, events as dom_events, fragment, get_id, html, Dom};
use engines::{api::APIEngine, history::HistoryEngine, logger::LoggerEngine};
use events::AppEvent;
use futures_signals::signal::Mutable;
use futures_signals::signal::SignalExt;
use gloo::console::console;
use shared::machine::core::{Dispatcher, GroupEngine, Machine};
use state::AppState;
use types::AppMachine;
use wasm_bindgen_futures::spawn_local;
use web_sys::window;
use web_sys::HtmlIFrameElement;

use yew::prelude::*;
use yew::use_state;

struct App {
    machine: AppMachine,
}

impl App {
    fn render(&self) -> Dom {
        let machine = self.machine.clone();

        html!("div", {
            .attr("id", "something")
            .text_signal(machine.state.signal_ref(|state| {
                if let Some(file) = state.current_file.clone() {
                    file.clone()
                } else {
                    "nothing loaded".to_string()
                }
            }))
            .children([
                iframe_portal(move || {
                    vec![
                    html!("div", {
                        .text_signal(machine.state.signal_ref(|state| {
                            if let Some(file) = state.current_file.clone() {
                                file.clone()
                            } else {
                                "nothing loaded".to_string()
                            }
                        }))
                    })
                ]
                })
            ])
        })
    }
}

#[derive(Clone)]
struct NodeRef<T> {
    value: Arc<T>,
}

fn iframe_portal<TChildren>(children: TChildren) -> Dom
where
    TChildren: Fn() -> Vec<Dom> + 'static,
{
    let iframe: Arc<Mutable<Option<NodeRef<HtmlIFrameElement>>>> = Arc::new(Mutable::new(None));

    let iframe2 = iframe.clone();

    spawn_local(async move {
        iframe2
            .signal_cloned()
            .for_each(move |iframe| {
                if let Some(iframe) = iframe {
                    let body = iframe.value.content_document().unwrap().body().unwrap();
                    append_dom(
                        &body,
                        html!("div", {
                            .children((children)())
                        }),
                    );
                }
                async {}
            })
            .await;
    });

    html!("iframe", {
        .event(move |event: dom_events::Load| {
            iframe.set(Some(NodeRef {
                value: Arc::new(wasm_bindgen::JsCast::dyn_into::<web_sys::HtmlIFrameElement>(event.target().unwrap()).unwrap())
            }));
        })
    })
}

fn main() {
    let machine = Machine::new(AppState::default(), |dispatcher| {
        Arc::new(GroupEngine::new(
            dispatcher,
            vec![
                Box::new(|dispatcher| Arc::new(APIEngine::new(dispatcher))),
                Box::new(|dispatcher| Arc::new(HistoryEngine::new(dispatcher))),
                Box::new(|_dispatcher| Arc::new(LoggerEngine {})),
            ],
        ))
    });

    machine.start();

    let app = App { machine };

    append_dom(&get_id("app"), app.render());
}
