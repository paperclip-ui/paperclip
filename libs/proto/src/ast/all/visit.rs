// use super::MutableExpressionRef;
// use super::{Expression};
pub use super::super::base;
pub use super::super::docco;
pub use super::super::pc;

macro_rules! visitable {
(
  $(
      ($match:path, $visit_name:ident, ($self:ident, $visitor:ident) $visit_children:block)
  ),*

) => {

    pub enum VisitorResult {
      Stop,
      Continue
    }

    pub trait Visitor {
      $(
        fn $visit_name(&mut self, _item: &mut $match) -> VisitorResult {
          VisitorResult::Continue
        }
      )*
    }

    pub trait Visitable {
      fn accept<TVisitor: Visitor>(&mut self, visitor: &mut TVisitor) -> VisitorResult;
    }

    $(
          impl Visitable for $match {
              fn accept<TVisitor: Visitor>(&mut $self, $visitor: &mut TVisitor) -> VisitorResult {
                if matches!($visitor.$visit_name($self), VisitorResult::Continue) && $visit_children {
                  VisitorResult::Continue
                } else {
                  VisitorResult::Stop
                }
              }
          }
    )*
};
}

macro_rules! visit_enum {
  ($this: expr, $visitor:ident, $($name: path), *) => {
      matches!(match $this {
          $(
              $name(expr) => {
                  expr.accept($visitor)
              }
          )*
      }, VisitorResult::Continue)
  };
}

macro_rules! visit_each {
    ($items: expr, $visitor:expr) => {{
        let mut should_continue = true;
        for item in $items {
            if matches!(item.accept($visitor), VisitorResult::Stop) {
                should_continue = false;
                break;
            }
        }
        should_continue
    }};
}

visitable! {
  (pc::Document, visit_document, (self, visitor) {
      visit_each!(&mut self.body, visitor)
  }),
  (pc::DocumentBodyItem, visit_document_body_item, (self, visitor) {
      visit_enum!(self.get_inner_mut(), visitor,
          pc::document_body_item::Inner::Import,
          pc::document_body_item::Inner::Style,
          pc::document_body_item::Inner::Component,
          pc::document_body_item::Inner::DocComment,
          pc::document_body_item::Inner::Text,
          pc::document_body_item::Inner::Atom,
          pc::document_body_item::Inner::Trigger,
          pc::document_body_item::Inner::Element
      )
  }),
  (pc::Import, visit_import, (self, visitor) {
    true
  }),
  (pc::Style, visit_style, (self, visitor) {
      true
  }),
  (pc::Component, visit_component, (self, visitor) {
    true
  }),
  (docco::Comment, visit_comment, (self, visitor) {
    true
  }),
  (pc::TextNode, visit_text_node, (self, visitor) {
    true
  }),
  (pc::Atom, visit_atom, (self, visitor) {
    true
  }),
  (pc::Trigger, visit_trigger, (self, visitor) {
    true
  }),
  (pc::Parameter, visit_parameter, (self, visitor) {
    true
  }),
  (pc::Node, visit_node, (self, visitor) {
    true
  }),
  (pc::Element, visit_element, (self, visitor) {
      visit_each!(&mut self.parameters, visitor) && visit_each!(&mut self.body, visitor)
  }),
  (pc::Slot, visit_slot, (self, visitor) {
      visit_each!(&mut self.body, visitor)
  }),
  (pc::Insert, visit_insert, (self, visitor) {
      visit_each!(&mut self.body, visitor)
  }),
  (pc::Override, visit_override, (self, visitor) {
      visit_each!(&mut self.body, visitor)
  }),
  (pc::OverrideBodyItem, visit_override_body_item, (self, visitor) {
      visit_enum!(self.get_inner_mut(), visitor, pc::override_body_item::Inner::Style, pc::override_body_item::Inner::Variant)
  }),
  (pc::Variant, visit_variant, (self, visitor) {
      visit_each!(&mut self.triggers, visitor)
  }),
  (pc::TriggerBodyItem, visit_trigger_body_item, (self, visitor) {
      visit_enum!(self.get_inner_mut(), visitor, pc::trigger_body_item::Inner::Str, pc::trigger_body_item::Inner::Reference, pc::trigger_body_item::Inner::Boolean)
  }),
  (pc::Reference, visit_reference, (self, visitor) {
      true
  }),
  (base::Str, visit_str, (self, visitor) {
    true
  }),
  (base::Boolean, visit_boolean, (self, visitor) {
    true
  })
}
