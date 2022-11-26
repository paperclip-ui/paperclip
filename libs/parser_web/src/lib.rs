use wasm_bindgen::prelude::*;
use paperclip_parser::{pc, core::errors::ParserError};
use paperclip_proto::ast::pc as pc_ast;

#[wasm_bindgen]
pub fn parse_pc(source: &str, id_seed: &str) -> JsValue {
  serde_wasm_bindgen::to_value(&pc::parser::parse(source, id_seed).unwrap()).unwrap()
}

#[wasm_bindgen]
pub fn serialize_pc(ast: JsValue) -> String {
  pc::serializer::serialize(&serde_wasm_bindgen::from_value(ast).unwrap())
}