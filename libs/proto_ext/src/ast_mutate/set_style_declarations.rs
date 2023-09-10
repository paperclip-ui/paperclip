use std::collections::HashMap;

use super::base::EditContext;
use super::utils::{parse_import, resolve_import, resolve_imports, NamespaceResolution};
use crate::ast::get_expr::GetExpr;
use paperclip_common::get_or_short;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::all::{Expression, ExpressionWrapper};
use paperclip_proto::ast::graph_ext::Dependency;
use paperclip_proto::ast::pc::Render;
use paperclip_proto::ast_mutate::{
    mutation_result, ExpressionUpdated, MutationResult, SetStyleDeclarations,
};
use std::cell::RefCell;
use std::rc::Rc;

impl MutableVisitor<()> for EditContext<SetStyleDeclarations> {
    fn visit_style(&mut self, expr: &mut ast::pc::Style) -> VisitorResult<()> {
        if expr.get_id() == self.mutation.expression_id {
            let new_style = parse_style(
                &mutation_to_style(&self.mutation, self.get_dependency()),
                &self.new_id(),
            );
            update_style(expr, &new_style, &get_styles_to_delete(&self.mutation));
        }
        VisitorResult::Continue
    }

    fn visit_document(&mut self, doc: &mut ast::pc::Document) -> VisitorResult<()> {
        if !matches!(
            GetExpr::get_expr(&self.mutation.expression_id, doc),
            Some(_)
        ) {
            return VisitorResult::Continue;
        }

        for (path, resolution) in get_dep_imports(&self.mutation, self.get_dependency()) {
            if resolution.is_new {
                if let Some(ns) = &resolution.resolved {
                    let relative = resolve_import(&self.get_dependency().path, &path);
                    doc.body
                        .insert(0, parse_import(&relative, &ns, &self.new_id()));
                }
            }
        }

        VisitorResult::Continue
    }

    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult<()> {
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

    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
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
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
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
) -> VisitorResult<()> {
    let mutation = &ctx.mutation;
    let dependency = ctx.get_dependency();

    let mut new_style: ast::pc::Style =
        parse_style(&mutation_to_style(mutation, dependency), &ctx.new_id());

    let mut doc = dependency.document.clone().expect("Document must exist");

    let variant_names = mutation
        .variant_ids
        .iter()
        .map(|id| match GetExpr::get_expr(id, &mut doc) {
            Some(ExpressionWrapper::Variant(variant)) => Some(variant.name.to_string()),
            _ => None,
        })
        .filter_map(|name| name)
        .collect::<Vec<String>>();

    new_style.variant_combo = variant_names
        .iter()
        .map(|name| ast::pc::Reference {
            id: ctx.new_id(),
            path: vec![name.to_string()],
            range: None,
        })
        .collect::<Vec<ast::pc::Reference>>();

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

fn variant_combo_equals(a: &Vec<ast::pc::Reference>, b: &Vec<ast::pc::Reference>) -> bool {
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

fn get_dep_imports(
    mutation: &SetStyleDeclarations,
    dep: &Dependency,
) -> HashMap<String, NamespaceResolution> {
    let mut imports = HashMap::new();

    for decl in &mutation.declarations {
        let resolved = resolve_imports(&decl.imports, dep);
        for (path, resolution) in resolved {
            imports.insert(path.to_string(), resolution);
        }
    }

    imports
}

fn parse_style(source: &str, checksum: &str) -> ast::pc::Style {
    parse_pc(source, checksum)
        .unwrap()
        .body
        .get(0)
        .unwrap()
        .clone()
        .try_into()
        .unwrap()
}

fn mutation_to_style(mutation: &SetStyleDeclarations, dep: &Dependency) -> String {
    let imports = get_dep_imports(mutation, dep);

    let mut buffer = "style {\n".to_string();

    for kv in &mutation.declarations {
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
