
use std::sync::Arc;

use dominator::{append_dom, events as dom_events, html, Dom};
use futures_signals::signal::Mutable;
use futures_signals::signal::SignalExt;
use wasm_bindgen_futures::spawn_local;
use web_sys::HtmlIFrameElement;

#[derive(Clone)]
struct NodeRef<T> {
    value: Arc<T>,
}

pub fn iframe_portal<TChildren>(children: TChildren) -> Dom
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
        .attr("style", "width: 100%; height: 100%; border: none;")
        .event(move |event: dom_events::Load| {
            iframe.set(Some(NodeRef {
                value: Arc::new(wasm_bindgen::JsCast::dyn_into::<web_sys::HtmlIFrameElement>(event.target().unwrap()).unwrap())
            }));
        })
    })
}
