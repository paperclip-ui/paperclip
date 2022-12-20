use crate::{ast::all::MutableVisitor, replace_child};
use paperclip_ast_serialize::serializable::Serializable;
use paperclip_common::get_or_short;
use paperclip_parser::pc::parser::parse;
use paperclip_proto::{
    ast::{
        all::{Expression, ExpressionWrapper},
        pc::{document_body_item, node, Component, Document, DocumentBodyItem, Element, Node},
    },
    ast_mutate::ConvertToComponent,
};

use super::EditContext;
use crate::ast::{all::VisitorResult, get_expr::GetExpr};

macro_rules! replace_child_with_instance {
    ($self: expr, $children: expr, $checksum: expr) => {
        let checksum = $checksum;

        replace_child!($children, &$self.mutation.expression_id, |v: &Node| {
            let target: ExpressionWrapper = v.into();
            let component_name =
                get_component_name(&target, $self.get_dependency().document.as_ref().unwrap());
            node::Inner::Element(create_element(&component_name, &checksum)).get_outer()
        })
    };
}

impl<'a> MutableVisitor<()> for EditContext<'a, ConvertToComponent> {
    fn visit_document(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<()> {
        let found_expr = get_or_short!(
            GetExpr::get_expr(&self.mutation.expression_id, expr),
            VisitorResult::Continue
        );

        let checksum = expr.checksum();
        let new_component = create_component(
            &get_component_name(&found_expr, expr),
            found_expr.serialize().as_str(),
            &checksum,
        );

        let insert_index = get_component_insert_index(&self.mutation.expression_id, expr);

        expr.body.insert(
            insert_index,
            document_body_item::Inner::Component(new_component).get_outer(),
        );

        // filter out expression if at the document body level
        expr.body = expr
            .body
            .clone()
            .into_iter()
            .filter(|expr| expr.get_id() != self.mutation.expression_id)
            .collect::<Vec<DocumentBodyItem>>();

        VisitorResult::Continue
    }
    fn visit_element(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> crate::ast::all::VisitorResult<()> {
        replace_child_with_instance!(self, expr.body, expr.checksum());
        VisitorResult::Continue
    }
    fn visit_slot(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Slot,
    ) -> crate::ast::all::VisitorResult<()> {
        replace_child_with_instance!(self, expr.body, expr.checksum());
        VisitorResult::Continue
    }
    fn visit_render(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Render,
    ) -> crate::ast::all::VisitorResult<()> {
        if expr.node.as_ref().unwrap().get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }
        let target: ExpressionWrapper = expr.node.as_mut().unwrap().into();
        let checksum = expr.checksum();

        let component_name =
            get_component_name(&target, self.get_dependency().document.as_ref().unwrap());
        expr.node =
            Some(node::Inner::Element(create_element(&component_name, &checksum)).get_outer());
        VisitorResult::Continue
    }

    fn visit_insert(
        &mut self,
        expr: &mut paperclip_proto::ast::pc::Insert,
    ) -> crate::ast::all::VisitorResult<()> {
        replace_child_with_instance!(self, expr.body, expr.checksum());
        VisitorResult::Continue
    }
}

fn get_component_insert_index(matching_id: &str, expr: &Document) -> usize {
    let first_component =
        expr.body
            .iter()
            .enumerate()
            .find(|(_i, item)| item.get_id() == matching_id)
            .or(expr.body.iter().enumerate().find(|(_i, item)| {
                matches!(item.get_inner(), document_body_item::Inner::Component(_))
            }))
            .or(expr.body.iter().enumerate().find(|(_i, item)| {
                matches!(item.get_inner(), document_body_item::Inner::Import(_))
            }));

    if let Some((i, _)) = first_component {
        i
    } else {
        0
    }
}

fn get_component_name(expr: &ExpressionWrapper, doc: &Document) -> String {
    let base_name = match expr {
        ExpressionWrapper::Element(element) => element.name.clone(),
        _ => None,
    };

    get_unique_component_name(&base_name.unwrap_or("Unnamed".to_string()), doc)
}

fn get_unique_component_name(base_name: &str, doc: &Document) -> String {
    let components = doc.get_components();

    let mut name = base_name.to_string();
    let mut i = 0;

    loop {
        let found_component = components.iter().find(|component| component.name == name);

        if matches!(found_component, None) {
            break;
        }

        i += 1;
        name = format!("{}{}", base_name, i);
    }

    name
}

fn create_element(tag_name: &str, checksum: &str) -> Element {
    let doc = parse(tag_name, checksum).unwrap();
    match doc.body.get(0).unwrap().get_inner() {
        document_body_item::Inner::Element(element) => Some(element),
        _ => None,
    }
    .unwrap()
    .clone()
}

fn create_component(name: &str, render: &str, checksum: &str) -> Component {
    let doc = parse(
        format!(
            r#"
    public component {} {{
      render {}
    }}
  "#,
            name, render
        )
        .as_str(),
        checksum,
    )
    .unwrap();
    match doc.body.get(0).unwrap().get_inner() {
        document_body_item::Inner::Component(expr) => Some(expr),
        _ => None,
    }
    .unwrap()
    .clone()
}
