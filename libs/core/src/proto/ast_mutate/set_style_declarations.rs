use std::collections::HashMap;

use super::base::EditContext;
use super::utils::{resolve_imports, NamespaceResolution};
use paperclip_common::get_or_short;
use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::pc::Render;
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::wrapper::{Expression, ExpressionWrapper};
use paperclip_proto::ast_mutate::{
    mutation, mutation_result, AddImport, ExpressionUpdated, MutationResult, SetStyleDeclarations,
};
use std::cell::RefCell;
use std::rc::Rc;

impl MutableVisitor<()> for EditContext<SetStyleDeclarations> {
    fn visit_style(&self, expr: &mut ast::pc::Style) -> VisitorResult<(), Self> {
        if expr.get_id() == self.mutation.expression_id {
            let new_style = parse_style(&mutation_to_style(&self), &self.new_id());
            update_style(expr, &new_style, &get_styles_to_delete(&self.mutation));
        }
        VisitorResult::Continue
    }

    fn visit_text_node(&self, expr: &mut ast::pc::TextNode) -> VisitorResult<(), Self> {
        if expr.get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }
        return add_child_style(
            self.changes.clone(),
            &mut expr.body,
            &self.mutation.expression_id,
            &self,
        );
    }

    fn visit_element(&self, expr: &mut ast::pc::Element) -> VisitorResult<(), Self> {
        if expr.get_id() == &self.mutation.expression_id {
            return add_child_style(
                self.changes.clone(),
                &mut expr.body,
                &self.mutation.expression_id,
                &self,
            );
        }

        VisitorResult::Continue
    }
    fn visit_component(&self, expr: &mut ast::pc::Component) -> VisitorResult<(), Self> {
        if expr.get_id() == &self.mutation.expression_id {
            let render_expr: &mut Render = get_or_short!(
                expr.body.iter_mut().find(|x| {
                    matches!(
                        x.get_inner(),
                        ast::pc::component_body_item::Inner::Render(_)
                    )
                }),
                VisitorResult::Continue
            )
            .try_into()
            .expect("Must be render");

            let el = render_expr.node.as_mut().expect("Node must exist");

            let parent_id = el.get_id().to_string();

            let mut body = match el.get_inner_mut() {
                ast::pc::node::Inner::Element(el) => &mut el.body,
                ast::pc::node::Inner::Text(el) => &mut el.body,
                _ => return VisitorResult::Continue,
            };

            return add_child_style(self.changes.clone(), &mut body, &parent_id, &self);
        }
        VisitorResult::Continue
    }
}

fn add_child_style(
    changes: Rc<RefCell<Vec<MutationResult>>>,
    children: &mut Vec<ast::pc::Node>,
    parent_id: &str,
    ctx: &EditContext<SetStyleDeclarations>,
) -> VisitorResult<(), EditContext<SetStyleDeclarations>> {
    let mutation = &ctx.mutation;
    let dependency = ctx.get_dependency();

    let mut new_style: ast::pc::Style = parse_style(&mutation_to_style(ctx), &ctx.new_id());

    let mut doc = dependency.document.clone().expect("Document must exist");

    let variant_names = mutation
        .variant_ids
        .iter()
        .map(|id| match ctx.expr_map.get_expr(id) {
            Some(info) => match info {
                ExpressionWrapper::Variant(variant) => Some(variant.name.to_string()),
                _ => None,
            },
            _ => None,
        })
        .filter_map(|name| name)
        .collect::<Vec<String>>();

    new_style.variant_combo = variant_names
        .iter()
        .map(|name| ast::shared::Reference {
            id: ctx.new_id(),
            path: vec![name.to_string()],
            range: None,
        })
        .collect::<Vec<ast::shared::Reference>>();

    let mut found = false;

    for child in children.iter_mut() {
        if let ast::pc::node::Inner::Style(style) = child.get_inner_mut() {
            if variant_combo_equals(&style.variant_combo, &new_style.variant_combo) {
                update_style(style, &new_style, &get_styles_to_delete(mutation));
                found = true;
            }
        }
    }

    if !found {
        children.insert(0, ast::pc::node::Inner::Style(new_style).get_outer());
    }

    changes.borrow_mut().push(
        mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
            id: parent_id.to_string(),
        })
        .get_outer(),
    );

    VisitorResult::Continue
}

fn variant_combo_equals(a: &Vec<ast::shared::Reference>, b: &Vec<ast::shared::Reference>) -> bool {
    if a.len() != b.len() {
        return false;
    }

    if a.len() == 0 {
        return true;
    }

    !matches!(
        a.iter()
            .find(|a1| { matches!(b.iter().find(|b1| { b1.path == a1.path }), Some(_)) }),
        None
    )
}

fn resolve_dep_imports(
    ctx: &EditContext<SetStyleDeclarations>,
) -> HashMap<String, NamespaceResolution> {
    let mut imports = HashMap::new();

    for decl in &ctx.mutation.declarations {
        let resolved = resolve_imports(&decl.imports, ctx.get_dependency(), &ctx.config_context);
        for (path, resolution) in resolved {
            if let Some(namespace) = &resolution.resolved {
                ctx.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: namespace.to_string(),
                        path: path.to_string(),
                    })
                    .get_outer(),
                );
            }
            imports.insert(path.to_string(), resolution);
        }
    }

    imports
}

fn parse_style(source: &str, checksum: &str) -> ast::pc::Style {
    parse_pc(source, checksum, &Options::new(vec![]))
        .unwrap()
        .body
        .get(0)
        .unwrap()
        .clone()
        .try_into()
        .unwrap()
}

fn mutation_to_style(ctx: &EditContext<SetStyleDeclarations>) -> String {
    let imports = resolve_dep_imports(ctx);

    let mut buffer = "style {\n".to_string();

    for kv in &ctx.mutation.declarations {
        let mut value = kv.value.to_string();

        for (_, resolution) in imports.iter() {
            if let Some(ns) = &resolution.resolved {
                value = value.replace(&resolution.prev, ns);
            } else {
                value = value.replace(format!("{}.", resolution.prev).as_str(), "");
            }
        }

        if value != "" {
            buffer = format!("{}{}: {}\n", buffer, kv.name, value)
        }
    }

    buffer = format!("{}{}", buffer, "}");

    buffer
}

fn get_styles_to_delete(mutation: &SetStyleDeclarations) -> Vec<String> {
    let mut styles = Vec::new();

    for decl in &mutation.declarations {
        if decl.value == "" {
            styles.push(decl.name.to_string());
        }
    }

    styles
}

fn update_style(
    style: &mut ast::pc::Style,
    new_style: &ast::pc::Style,
    omit_decl_names: &Vec<String>,
) {
    for decl in &new_style.declarations {
        let mut found = false;
        for existing_decl in &mut style.declarations {
            if existing_decl.name == decl.name {
                existing_decl.value = decl.value.clone();
                found = true;
            }
        }
        if !found {
            style.declarations.push(decl.clone());
        }
    }

    for decl_name in omit_decl_names {
        style.declarations = style
            .declarations
            .clone()
            .into_iter()
            .filter(|decl| decl.name != *decl_name)
            .collect();
    }
}
