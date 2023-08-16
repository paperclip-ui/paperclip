use paperclip_common::fs::FileResolver;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::virt::module::PcModule;
use wasm_bindgen::prelude::*;

pub mod core;
pub mod css;
pub mod html;

#[wasm_bindgen]
pub async fn evaluate(path: String, graph: JsValue) -> JsValue {
    let graph: Graph = serde_wasm_bindgen::from_value(graph).unwrap();

    let html = html::evaluator::evaluate(
        &path,
        &graph,
        &JsFileResolver::default(),
        html::context::Options {
            include_components: true,
        },
    )
    .await
    .unwrap();

    let css = css::evaluator::evaluate(&path, &graph, &JsFileResolver::default())
        .await
        .unwrap();

    let module = PcModule {
        html: Some(html),
        css: Some(css),
        imports: vec![],
    };

    serde_wasm_bindgen::to_value(&module).unwrap()
}

#[derive(Clone, Default)]
struct JsFileResolver;

impl FileResolver for JsFileResolver {
    fn resolve_file(&self, from: &str, to: &str) -> anyhow::Result<String> {
        Ok(String::from(
            std::path::Path::new(from)
                .parent()
                .unwrap()
                .join(to)
                .to_str()
                .unwrap(),
        ))
    }
}
