use std::collections::HashMap;

use paperclip_parser::{
    core::{errors::ParserError, parser_context::Options},
    pc::parser::parse,
};
use paperclip_proto::ast::{graph::Dependency, pc::document_body_item, wrapper::ExpressionWrapper};

use super::update_expr_imports::UpdateExprImports;

pub struct PasteResult {
    pub imports: HashMap<String, String>,
    pub expressions: Vec<ExpressionWrapper>,
}

pub fn paste_expression(
    source: &str,
    path: Option<String>,
    to_dep: &Dependency,
) -> Result<PasteResult, ParserError> {
    let doc = parse(source, &to_dep.hash, &Options::all_experiments())?;

    let mut imports: HashMap<String, String> = HashMap::new();

    for import in doc.get_imports() {
        imports.insert(import.path.to_string(), import.path.to_string());
    }
    let mut items: Vec<ExpressionWrapper> = doc
        .body
        .clone()
        .into_iter()
        .filter(|item| !matches!(item.get_inner(), document_body_item::Inner::Import(_)))
        .map(|item| item.into())
        .collect();
    let mut resolved_imports = HashMap::new();

    let path = path.unwrap_or("/____ephemeral-path_____.pc".to_string());

    for item in items.iter_mut() {
        resolved_imports.extend(UpdateExprImports::apply2(item, &path, &imports, to_dep));
    }

    Ok(PasteResult {
        imports: resolved_imports,
        expressions: items,
    })
}
