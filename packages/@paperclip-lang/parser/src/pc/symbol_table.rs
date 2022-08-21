use crate::graph::graph::Graph;
use crate::pc::ast as pc_ast;
use std::collections::HashMap;
use std::rc::{Rc, Weak};

#[derive(Debug)]
pub struct Import {
    path: String,
}

#[derive(Debug)]
pub struct Style {
    reference: Rc<pc_ast::Style>,
}

#[derive(Debug)]
pub enum SymbolTableItem {
    Import(Import),
    Style(Weak<Style>),
}

struct GraphSymbolTable {
    records: HashMap<String, SymbolTableItem>
}

pub async fn get_symbol_table<'expr>(
    path: &str,
    graph: Graph,
) -> Option<&HashMap<String, SymbolTableItem>> {
  None
    // if let Some(dep) = graph.dependencies.lock().await.get(path) {
    // } else {
    //     None
    // }
}
