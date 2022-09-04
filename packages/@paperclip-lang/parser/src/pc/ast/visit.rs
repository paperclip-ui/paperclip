// inspired by https://github.com/swc-project/swc/discussions/3044

use super::state as ast;
use crate::base::ast as base_ast;

pub trait Visitor {
    fn visit<V: Visitable>(&mut self, visitable: &V);
}

pub enum Expression<'expr> {
    Document(&'expr ast::Document),
    Atom(&'expr ast::Atom),
    Trigger(&'expr ast::Trigger),
    String(&'expr base_ast::Str),
    Component(&'expr ast::Component),
    Render(&'expr ast::Render),
    RenderNode(&'expr ast::RenderNode),
    ComponentBodyItem(&'expr ast::ComponentBodyItem),
    Element(&'expr ast::Element),
    TextNode(&'expr ast::TextNode),
    Variant(&'expr ast::Variant),
    Style(&'expr ast::Style),
}

pub trait Visitable {
    fn accept<V: Visitor>(&self, visitor: &mut V);
    fn wrap<'expr>(&'expr self) -> Expression<'expr>;
}

macro_rules! visitable_expr {
    ($($expr: ident),*) => {
        $(
            impl Visitable for ast::$expr {
                fn accept<V: Visitor>(&self, visitor: &mut V) {
                    visitor.visit(self);
                }
                fn wrap<'expr>(&'expr self) -> Expression<'expr> {
                    Expression::$expr(self)
                }
            }
        )*
    };
}

visitable_expr! {
    Document,
    Atom,
    Render,
    RenderNode,
    Trigger,
    Component,
    ComponentBodyItem,
    Element,
    TextNode,
    Variant,
    Style
}
