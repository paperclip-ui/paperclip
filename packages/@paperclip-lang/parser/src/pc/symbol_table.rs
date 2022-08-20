use crate::graph::graph::{Dependency, Graph};
use crate::pc::ast as pc_ast;
use std::collections::HashMap;

pub struct Import<'dependency> {
  path: String
}

pub struct Style<'style> {
  reference: &'style pc_ast::Style
}

pub enum SymbolTableEntry<'dependency, 'style> {
  Import(Import<'dependency>),
  Style(Style<'style>)
}

pub fn get_symbol_table(graph: Graph) -> HashMap<String, SymbolTableEntry> {

}