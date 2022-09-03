use paperclip_parser::pc::ast::Document;
use anyhow::Result;
use super::state::Module;


type AssetResolver = dyn Fn(&str) -> String;

pub fn translate_interim(document: &Document, resolve_asset: Box<AssetResolver>) -> Result<Module> {

}
