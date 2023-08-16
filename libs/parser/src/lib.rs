use wasm_bindgen::prelude::*;

#[macro_use]
pub mod base;
pub mod core;
pub mod css;
pub mod docco;
pub mod pc;

#[wasm_bindgen]
pub fn parse_pc(source: String, seed: String) -> JsValue {
    let doc = pc::parser::parse(&source, &seed).unwrap();
    serde_wasm_bindgen::to_value(&doc).unwrap()
}
