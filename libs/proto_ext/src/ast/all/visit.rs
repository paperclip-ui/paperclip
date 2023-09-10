pub use paperclip_proto::ast::base;
pub use paperclip_proto::ast::css;
pub use paperclip_proto::ast::docco;
pub use paperclip_proto::ast::graph;
pub use paperclip_proto::ast::pc;

macro_rules! visitable {
(
  $(
      ($match:path, $visit_name:ident, ($self:ident, $visitor:ident) $visit_children:block, $visit_children_mut:block)
  ),*

) => {

    pub enum VisitorResult<TRet> {
      Return(TRet),
      Continue
    }

    impl<TRet> VisitorResult<TRet> {
        fn or<Other>(self, other: &mut Other) -> VisitorResult<TRet> where Other: FnMut() -> VisitorResult<TRet> {
            if let VisitorResult::Return(value) = self {
                VisitorResult::Return(value)
            } else {
                other()
            }
        }
    }

    pub trait Visitor<TRet> {
      $(
        fn $visit_name(&mut self, _item: &$match) -> VisitorResult<TRet> {
          VisitorResult::Continue
        }
      )*
    }

    pub trait MutableVisitor<TRet> {
      $(
        fn $visit_name(&mut self, _item: &mut $match) -> VisitorResult<TRet> {
          VisitorResult::Continue
        }
      )*
    }

    pub trait Visitable {
      fn accept<TRet, TVisitor: Visitor<TRet>>(&self, visitor: &mut TVisitor) -> VisitorResult<TRet>;
    }

    $(
          impl Visitable for $match {
              fn accept<TRet, TVisitor: Visitor<TRet>>(&$self, $visitor: &mut TVisitor) -> VisitorResult<TRet> {
                let ret = $visitor.$visit_name($self);

                if matches!(ret, VisitorResult::Return(_)) {
                  ret
                } else {
                  $visit_children
                }
              }
          }
    )*

    pub trait MutableVisitable {
      fn accept<TRet, TVisitor: MutableVisitor<TRet>>(&mut self, visitor: &mut TVisitor) -> VisitorResult<TRet>;
    }


    $(
      impl MutableVisitable for $match {
          fn accept<TRet, TVisitor: MutableVisitor<TRet>>(&mut $self, $visitor: &mut TVisitor) -> VisitorResult<TRet> {
            let ret = $visitor.$visit_name($self);

            if matches!(ret, VisitorResult::Return(_)) {
              ret
            } else {
              $visit_children_mut
            }
          }
      }
)*


};
}

macro_rules! visit_enum {
  ($this: expr, $visitor:ident, $($name: path), *) => {
    match $this {
      $(
          $name(expr) => {
              expr.accept($visitor)
          }
      )*
    }
  };
}

macro_rules! visit_each {
    ($items: expr, $visitor:expr) => {{
        let mut ret = VisitorResult::Continue;
        for item in $items {
            ret = item.accept($visitor);
            if matches!(ret, VisitorResult::Return(_)) {
                break;
            }
        }
        ret
    }};
}

visitable! {
    (graph::Dependency, visit_dependency, (self, visitor) {
        if let Some(document) = &self.document {
            document.accept(visitor)
        } else {
            VisitorResult::Continue
        }
  }, {

      if let Some(document) = &mut self.document {
          document.accept(visitor)
      } else {
          VisitorResult::Continue
      }
  }),
  (pc::Document, visit_document, (self, visitor) {
    visit_each!(&self.body, visitor)
}, {
  visit_each!(&mut self.body, visitor)
}),
  (pc::DocumentBodyItem, visit_document_body_item, (self, visitor) {
    visit_enum!(self.get_inner(), visitor,
        pc::document_body_item::Inner::Import,
        pc::document_body_item::Inner::Style,
        pc::document_body_item::Inner::Component,
        pc::document_body_item::Inner::DocComment,
        pc::document_body_item::Inner::Text,
        pc::document_body_item::Inner::Atom,
        pc::document_body_item::Inner::Trigger,
        pc::document_body_item::Inner::Element
    )
}, {
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
      VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::Style, visit_style, (self, visitor) {
      visit_each!(&self.extends, visitor).or(&mut || {
          visit_each!(&self.declarations, visitor)
      })
  },{
      visit_each!(&mut self.extends, visitor).or(&mut || {
          visit_each!(&mut self.declarations, visitor)
      })
  }),
  (css::StyleDeclaration, visit_css_declaration, (self, visitor) {
    if let Some(value) = &self.value  {
        value.accept(visitor)
    } else {
        VisitorResult::Continue
    }
  },{
      if let Some(value) = &mut self.value  {
          value.accept(visitor)
      } else {
          VisitorResult::Continue
      }
  }),

  (css::DeclarationValue, visit_css_declaration_value, (self, visitor) {
      visit_enum!(self.get_inner(), visitor,
          css::declaration_value::Inner::Number,
          css::declaration_value::Inner::Reference,
          css::declaration_value::Inner::Str,
          css::declaration_value::Inner::Measurement,
          css::declaration_value::Inner::FunctionCall,
          css::declaration_value::Inner::Arithmetic,
          css::declaration_value::Inner::HexColor,
          css::declaration_value::Inner::SpacedList,
          css::declaration_value::Inner::CommaList
      )
  },{
      visit_enum!(self.get_inner_mut(), visitor,
          css::declaration_value::Inner::Number,
          css::declaration_value::Inner::Reference,
          css::declaration_value::Inner::Str,
          css::declaration_value::Inner::Measurement,
          css::declaration_value::Inner::FunctionCall,
          css::declaration_value::Inner::Arithmetic,
          css::declaration_value::Inner::HexColor,
          css::declaration_value::Inner::SpacedList,
          css::declaration_value::Inner::CommaList
      )
  }),
  (Box<css::DeclarationValue>, visit_box_css_declaration_value, (self, visitor) {
      visit_enum!(self.get_inner(), visitor,
          css::declaration_value::Inner::Number,
          css::declaration_value::Inner::Reference,
          css::declaration_value::Inner::Str,
          css::declaration_value::Inner::Measurement,
          css::declaration_value::Inner::FunctionCall,
          css::declaration_value::Inner::Arithmetic,
          css::declaration_value::Inner::HexColor,
          css::declaration_value::Inner::SpacedList,
          css::declaration_value::Inner::CommaList
      )
  },{
      visit_enum!(self.get_inner_mut(), visitor,
          css::declaration_value::Inner::Number,
          css::declaration_value::Inner::Reference,
          css::declaration_value::Inner::Str,
          css::declaration_value::Inner::Measurement,
          css::declaration_value::Inner::FunctionCall,
          css::declaration_value::Inner::Arithmetic,
          css::declaration_value::Inner::HexColor,
          css::declaration_value::Inner::SpacedList,
          css::declaration_value::Inner::CommaList
      )
  }),
  (css::Reference, visit_css_reference, (self, visitor) {
      VisitorResult::Continue
  },{
      VisitorResult::Continue
  }),
  (css::Measurement, visit_css_measurement, (self, visitor) {
      VisitorResult::Continue
  },{
      VisitorResult::Continue
  }),
  (Box<css::FunctionCall>, visit_css_function_call, (self, visitor) {
      visit_each!(&self.arguments, visitor)
  },{
      visit_each!(&mut self.arguments, visitor)
  }),
  (Box<css::Arithmetic>, visit_css_bx_arithmetic, (self, visitor) {
      self.left.as_ref().expect("Left must exist").accept(visitor).or(&mut || {
          self.right.as_ref().expect("Right must exist").accept(visitor)
      })
  },{
      self.left.as_mut().expect("Left must exist").accept(visitor).or(&mut || {
          self.right.as_mut().expect("Right must exist").accept(visitor)
      })
  }),
  (css::HexColor, visit_css_hex_color, (self, visitor) {
      VisitorResult::Continue
  },{
      VisitorResult::Continue
  }),
  (css::CommaList, visit_css_comma_list, (self, visitor) {
      visit_each!(&self.items, visitor)
  },{
      visit_each!(&mut self.items, visitor)
  }),
  (css::SpacedList, visit_css_spaced_list, (self, visitor) {
      visit_each!(&self.items, visitor)
  },{
      visit_each!(&mut self.items, visitor)
  }),
  (pc::Component, visit_component, (self, visitor) {
    visit_each!(&self.body, visitor)
  }, {
    visit_each!(&mut self.body, visitor)
  }),
  (pc::ComponentBodyItem, visit_component_body_item, (self, visitor) {
    visit_enum!(self.get_inner(), visitor,
      pc::component_body_item::Inner::Render,
      pc::component_body_item::Inner::Variant,
      pc::component_body_item::Inner::Script
    )
  }, {
    visit_enum!(self.get_inner_mut(), visitor,
      pc::component_body_item::Inner::Render,
      pc::component_body_item::Inner::Variant,
      pc::component_body_item::Inner::Script
    )
  }),
  (pc::Render, visit_render, (self, visitor) {
    self.node.as_ref().expect("Node must exist").accept(visitor)
  }, {
    self.node.as_mut().expect("Node must exist").accept(visitor)
  }),
  (pc::Script, visit_script, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (docco::Comment, visit_comment, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::TextNode, visit_text_node, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::Atom, visit_atom, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::Trigger, visit_trigger, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::Parameter, visit_parameter, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (pc::Node, visit_node, (self, visitor) {
    visit_enum!(self.get_inner(), visitor,
    pc::node::Inner::Element,
    pc::node::Inner::Insert,
    pc::node::Inner::Style,
    pc::node::Inner::Text,
    pc::node::Inner::Override,
    pc::node::Inner::Slot
      )
  }, {
    visit_enum!(self.get_inner_mut(), visitor,
    pc::node::Inner::Element,
    pc::node::Inner::Insert,
    pc::node::Inner::Style,
    pc::node::Inner::Text,
    pc::node::Inner::Override,
    pc::node::Inner::Slot
      )
  }),
  (pc::Element, visit_element, (self, visitor) {
    if let VisitorResult::Return(ret) = visit_each!(&self.parameters, visitor) {
      VisitorResult::Return(ret)
    } else {
      visit_each!(&self.body, visitor)
    }
  }, {
    if let VisitorResult::Return(ret) = visit_each!(&mut self.parameters, visitor) {
      VisitorResult::Return(ret)
    } else {
      visit_each!(&mut self.body, visitor)
    }
  }),
  (pc::Slot, visit_slot, (self, visitor) {
    visit_each!(&self.body, visitor)
}, {
  visit_each!(&mut self.body, visitor)
}),
  (pc::Insert, visit_insert, (self, visitor) {
    visit_each!(&self.body, visitor)
}, {
  visit_each!(&mut self.body, visitor)
}),
  (pc::Override, visit_override, (self, visitor) {
      visit_each!(&self.body, visitor)
  }, {
    visit_each!(&mut self.body, visitor)
}),
  (pc::OverrideBodyItem, visit_override_body_item, (self, visitor) {
    visit_enum!(self.get_inner(), visitor, pc::override_body_item::Inner::Style, pc::override_body_item::Inner::Variant)
}, {
  visit_enum!(self.get_inner_mut(), visitor, pc::override_body_item::Inner::Style, pc::override_body_item::Inner::Variant)
}),
  (pc::Variant, visit_variant, (self, visitor) {
    visit_each!(&self.triggers, visitor)
}, {
  visit_each!(&mut self.triggers, visitor)
}),
(pc::TriggerBodyItem, visit_trigger_body_item, (self, visitor) {
  visit_enum!(self.get_inner(), visitor, pc::trigger_body_item::Inner::Str, pc::trigger_body_item::Inner::Reference, pc::trigger_body_item::Inner::Bool)
}, {
visit_enum!(self.get_inner_mut(), visitor, pc::trigger_body_item::Inner::Str, pc::trigger_body_item::Inner::Reference, pc::trigger_body_item::Inner::Bool)
}),
(pc::TriggerBodyItemCombo, visit_trigger_body_combo, (self, visitor) {
  visit_each!(&self.items, visitor)
}, {
  visit_each!(&mut self.items, visitor)
}),
  (pc::Reference, visit_reference, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (base::Str, visit_str, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (base::Num, visit_num, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  }),
  (base::Bool, visit_boolean, (self, visitor) {
    VisitorResult::Continue
  }, {
    VisitorResult::Continue
  })
}
