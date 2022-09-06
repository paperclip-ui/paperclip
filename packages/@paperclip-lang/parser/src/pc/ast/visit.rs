// inspired by https://github.com/swc-project/swc/discussions/3044

use super::state as ast;

pub trait Visitor {
    fn visit<V: Visitable>(&mut self, visitable: &V);
}

pub trait Visitable {
    fn accept<V: Visitor>(&self, visitor: &mut V);
    fn wrap<'expr>(&'expr self) -> Expression<'expr>;
}

macro_rules! visitable_expr {
    ($($expr: ident),*) => {

        pub enum Expression<'expr> {
            $(
                $expr(&'expr ast::$expr),
            )*
        }

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
    Import,
    DocumentBodyItem,
    Comment,
    Atom,
    Render,
    RenderNode,
    Trigger,
    TriggerBodyItem,
    Reference,
    Boolean,
    Str,
    Script,
    Insert,
    Override,
    OverrideBodyItem,
    Slot,
    Component,
    ComponentBodyItem,
    Element,
    ElementBodyItem,
    TextNode,
    Variant,
    Style
}
