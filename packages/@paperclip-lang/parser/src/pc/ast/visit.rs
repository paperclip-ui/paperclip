// inspired by https://github.com/swc-project/swc/discussions/3044

use super::state::*;
use crate::base::ast::visit::*;


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
    InsertBody,
    Override,
    OverrideBodyItem,
    Slot,
    SlotBodyItem,
    Component,
    ComponentBodyItem,
    Element,
    ElementBodyItem,
    TextNode,
    TextNodeBodyItem,
    Variant,
    Style
}
