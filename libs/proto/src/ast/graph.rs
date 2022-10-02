use super::pc;

#[derive(Debug)]
pub struct RefInfo<'expr> {
    pub path: &'expr str,
    pub expr: ReferencedExpr<'expr>,
}

#[derive(Debug)]
pub enum ReferencedExpr<'expr> {
    Document(&'expr pc::Document),
    Import(&'expr pc::Import),
    Atom(&'expr pc::Atom),
    Style(&'expr pc::Style),
    Component(&'expr pc::Component),
    Trigger(&'expr pc::Trigger),
}

pub trait Graph {
    fn get_ref(&self, ref_path: &Vec<String>, dep_path: &str) -> Option<RefInfo<'_>>;
}
