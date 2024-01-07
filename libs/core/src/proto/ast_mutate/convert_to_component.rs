use crate::replace_child;
use inflector::cases::pascalcase::to_pascal_case;
use paperclip_ast_serialize::serializable::Serializable;
use paperclip_common::{get_or_short, log::log_verbose};
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse;
use paperclip_proto::{
    ast::{
        pc::{node, Component, Document, Element, Node},
        wrapper::{Expression, ExpressionWrapper},
    },
    ast_mutate::{mutation_result, ConvertToComponent, ExpressionInserted},
};

use super::EditContext;

use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

macro_rules! replace_child_with_instance {
    ($self: expr, $children: expr, $checksum: expr) => {
        let checksum = $checksum;

        replace_child!($children, &$self.mutation.expression_id, |v: &Node| {
            let target: &Node = v.into();
            let component_name = get_component_name(
                &target,
                &$self.mutation.name,
                $self.get_dependency().document.as_ref().unwrap(),
            );
            node::Inner::Element(create_element(&component_name, &checksum)).get_outer()
        })
    };
}

impl MutableVisitor<()> for EditContext<ConvertToComponent> {
    fn visit_document(
        &self,
        expr: &mut paperclip_proto::ast::pc::Document,
    ) -> VisitorResult<(), EditContext<ConvertToComponent>> {
        let found_expr = get_or_short!(
            self.expr_map
                .get_expr_in(&self.mutation.expression_id, &expr.id),
            VisitorResult::Continue
        )
        .clone();

        let found_node: Node = match found_expr.try_into() {
            Ok(node) => node,
            Err(_) => {
                return VisitorResult::Continue;
            }
        };

        let new_component = create_component(
            &get_component_name(&found_node, &self.mutation.name, expr),
            &found_node,
            &self.new_id(),
        );

        let insert_index = get_component_insert_index(&self.mutation.expression_id, expr);

        self.add_change(
            mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                id: new_component.id.to_string(),
            })
            .get_outer(),
        );

        expr.body.insert(
            insert_index,
            node::Inner::Component(new_component).get_outer(),
        );

        // filter out expression if at the document body level
        expr.body = expr
            .body
            .clone()
            .into_iter()
            .filter(|expr| expr.get_id() != self.mutation.expression_id)
            .collect::<Vec<Node>>();

        VisitorResult::Continue
    }
    fn visit_element(
        &self,
        expr: &mut paperclip_proto::ast::pc::Element,
    ) -> VisitorResult<(), Self> {
        replace_child_with_instance!(self, expr.body, self.new_id());
        VisitorResult::Continue
    }
    fn visit_slot(&self, expr: &mut paperclip_proto::ast::pc::Slot) -> VisitorResult<(), Self> {
        replace_child_with_instance!(self, expr.body, self.new_id());
        VisitorResult::Continue
    }
    fn visit_render(
        &self,
        expr: &mut paperclip_proto::ast::pc::Render,
    ) -> VisitorResult<(), EditContext<ConvertToComponent>> {
        if expr.node.as_ref().unwrap().get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }
        let target: ExpressionWrapper = expr.node.as_mut().unwrap().into();
        let target: Node = target.try_into().expect("Must be a node");

        let component_name = get_component_name(
            &target,
            &self.mutation.name,
            self.get_dependency().document.as_ref().unwrap(),
        );
        expr.node =
            Some(node::Inner::Element(create_element(&component_name, &self.new_id())).get_outer());
        VisitorResult::Continue
    }

    fn visit_insert(&self, expr: &mut paperclip_proto::ast::pc::Insert) -> VisitorResult<(), Self> {
        replace_child_with_instance!(self, expr.body, self.new_id());
        VisitorResult::Continue
    }
}

fn get_component_insert_index(matching_id: &str, expr: &Document) -> usize {
    let first_component = expr
        .body
        .iter()
        .enumerate()
        .find(|(_i, item)| item.get_id() == matching_id)
        .or(expr
            .body
            .iter()
            .enumerate()
            .find(|(_i, item)| matches!(item.get_inner(), node::Inner::Component(_))))
        .or(expr
            .body
            .iter()
            .enumerate()
            .find(|(_i, item)| matches!(item.get_inner(), node::Inner::Import(_))));

    if let Some((i, _)) = first_component {
        i
    } else {
        0
    }
}

fn get_component_name(expr: &Node, name: &Option<String>, doc: &Document) -> String {
    let base_name: Option<String> = name.clone().or(match expr.get_inner() {
        node::Inner::Element(node) => node.name.clone(),
        node::Inner::Text(node) => node.name.clone(),
        _ => None,
    });

    get_unique_component_name(
        &to_pascal_case(&base_name.unwrap_or("Unnamed".to_string())),
        doc,
    )
}

pub fn get_unique_component_name(base_name: &str, doc: &Document) -> String {
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

fn create_element(tag_name: &str, id_seed: &str) -> Element {
    let doc = parse(tag_name, id_seed, &Options::new(vec![])).unwrap();
    match doc.body.get(0).unwrap().get_inner() {
        node::Inner::Element(element) => Some(element),
        _ => None,
    }
    .unwrap()
    .clone()
}

fn create_component(name: &str, render: &Node, id_seed: &str) -> Component {
    let doc_comment = render
        .get_doc_comment()
        .and_then(|comment| {
            let comment: ExpressionWrapper = (&comment).into();
            Some(comment.serialize(true))
        })
        .unwrap_or("".to_string());

    let render: ExpressionWrapper = (&render.strip_doc_comment()).into();

    let new_source = format!(
        r#"
{}
public component {} {{
  render {}
}}
"#,
        doc_comment,
        name,
        &render.serialize(true)
    );

    log_verbose(&format!("Create component {}", new_source));

    let doc = parse(&new_source, id_seed, &Options::new(vec![])).unwrap();
    match doc.body.get(0).unwrap().get_inner() {
        node::Inner::Component(expr) => Some(expr),
        _ => None,
    }
    .unwrap()
    .clone()
}
