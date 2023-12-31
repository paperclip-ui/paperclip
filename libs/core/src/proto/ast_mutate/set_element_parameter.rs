use super::base::EditContext;
use super::utils::{parse_element_attribute_value, upsert_render_expr};
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::{Element, Parameter};
use paperclip_proto::ast_mutate::SetElementParameter;

fn set_element_attribute(element: &mut Element, ctx: &EditContext<SetElementParameter>) {
    let value = if ctx.mutation.parameter_value == "" {
        None
    } else {
        Some(parse_element_attribute_value(
            &ctx.mutation.parameter_value,
            &ctx.new_id(),
        ))
    };

    if value.is_some() {
        let existing_param = if let Some(parameter_id) = &ctx.mutation.parameter_id {
            element
                .parameters
                .iter_mut()
                .find(|p| p.get_id() == parameter_id)
        } else {
            None
        };

        if let Some(param) = existing_param {
            param.name = ctx.mutation.parameter_name.clone();
            param.value = value;
        } else {
            element.parameters.push(Parameter {
                id: ctx.new_id(),
                name: ctx.mutation.parameter_name.clone(),
                range: None,
                value: value,
            });
        }
    } else {
        if let Some(parameter_id) = &ctx.mutation.parameter_id {
            element.parameters.retain(|p| &p.id != parameter_id);
        }
    }
}

impl MutableVisitor<()> for EditContext<SetElementParameter> {
    fn visit_element(
        &self,
        element: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<SetElementParameter>> {
        if self.mutation.target_id != element.get_id() {
            return VisitorResult::Continue;
        }

        set_element_attribute(element, &self);
        VisitorResult::Return(())
    }

    fn visit_component(
        &self,
        component: &mut ast::pc::Component,
    ) -> VisitorResult<(), EditContext<SetElementParameter>> {
        if self.mutation.target_id != component.get_id() {
            return VisitorResult::Continue;
        }

        let render_node = upsert_render_expr(component, true, &self);

        set_element_attribute(
            render_node
                .node
                .as_mut()
                .expect("Node must exist")
                .try_into()
                .expect("Element must exist"),
            &self,
        );
        VisitorResult::Return(())
    }
}
