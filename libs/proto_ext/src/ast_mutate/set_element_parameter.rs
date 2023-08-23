use super::base::EditContext;
use super::utils::{parse_element_attribute_value, parse_node};
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Parameter;
use paperclip_proto::ast_mutate::SetElementParameter;

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetElementParameter> {
    fn visit_element(&mut self, element: &mut ast::pc::Element) -> VisitorResult<()> {
        if self.mutation.element_id != element.get_id() {
            return VisitorResult::Continue;
        }

        let checksum = element.checksum();


        let value = if self.mutation.parameter_value == "" {
            None 
        } else {
            Some(parse_element_attribute_value(
            &self.mutation.parameter_value,
            &format!("{}-value", checksum),
        ))
    };

    if value.is_some() {

        let existing_param = if let Some(parameter_id) = &self.mutation.parameter_id {
            element
                .parameters
                .iter_mut()
                .find(|p| p.get_id() == parameter_id)
        } else {
            None
        };

        if let Some(param) = existing_param {
            param.name = self.mutation.parameter_name.clone();
            param.value = value;
        } else {
            element.parameters.push(Parameter {
                id: format!("{}-name", checksum),
                name: self.mutation.parameter_name.clone(),
                range: None,
                value: value
            });
        }
    } else {
        if let Some(parameter_id) = &self.mutation.parameter_id {
            element.parameters.retain(|p| &p.id != parameter_id);
        }
    }

        VisitorResult::Return(())
    }
}
