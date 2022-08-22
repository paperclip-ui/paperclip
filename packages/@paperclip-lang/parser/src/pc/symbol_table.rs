/*

Trying to figure out the structure of the symbol table.

- Rc won't work because that's not thread safe, and the AST will _definitely_ need to be passed into multi-threaded
environments for parsing and evaluation.
- Arc won't work because that involves locks and is slow
- Clone may be an option, but this might be expensive because of nesting.
- What about a _path_ to the reference?

*/

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
    Style(Style),
}

struct GraphSymbolTable {
    records: HashMap<String, SymbolTableItem>,
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
