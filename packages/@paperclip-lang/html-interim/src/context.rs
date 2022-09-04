
// use paperclip_common::id::{IDGenerator, get_document_id};
use paperclip_parser::pc::ast;
use std::rc::Rc;

type AssetResolver = dyn Fn(&str) -> String;

pub struct Context<'expr> {
    pub document: &'expr ast::Document,
    pub resolve_asset: Rc<Box<AssetResolver>>,
    pub current_component: Option<&'expr ast::Component>,
}

impl<'expr> Context<'expr> {
    pub fn new(document: &'expr ast::Document, resolve_asset: Box<AssetResolver>) -> Self {
        Self {
            resolve_asset: Rc::new(resolve_asset),
            document,
            current_component: None
        }
    }
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        Self {
            resolve_asset: self.resolve_asset.clone(),
            document: self.document,
            current_component: Some(component),
        }
    }
}
