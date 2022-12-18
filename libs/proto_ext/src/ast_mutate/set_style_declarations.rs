use std::collections::HashMap;
use std::path::Path;

use pathdiff::diff_paths;

use super::base::EditContext;
use super::utils::{parse_import, resolve_import, resolve_imports, add_imports, NamespaceResolution};
use crate::ast::get_expr::GetExpr;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::{Expression, ExpressionWrapper};
use paperclip_proto::ast::graph_ext::Dependency;
use paperclip_proto::ast_mutate::{
    mutation_result, ExpressionUpdated, MutationResult, SetStyleDeclarations,
};

use crate::ast::{all::MutableVisitor, all::VisitorResult};

impl<'expr> MutableVisitor<()> for EditContext<'expr, SetStyleDeclarations> {
    fn visit_style(&mut self, expr: &mut ast::pc::Style) -> VisitorResult<()> {
        if expr.get_id() == self.mutation.expression_id {
            let new_style = parse_style(
                &mutation_to_style(&self.mutation, &self.dependency),
                &expr.checksum(),
            );
            update_style(expr, &new_style);
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

        for (path, resolution) in get_dep_imports(&self.mutation, &self.dependency) {
            if resolution.is_new {
                if let Some(ns) = &resolution.resolved {
                    let relative = resolve_import(&self.dependency.path, &path);
                    doc.body.insert(0, parse_import(&relative, &ns, doc.checksum().as_str()));
                }
            }
        }

        VisitorResult::Continue
    }

    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult<()> {
        if expr.get_id() != self.mutation.expression_id {
            return VisitorResult::Continue;
        }
        let checksum = expr.checksum();
        return add_child_style(
            &mut self.changes,
            &mut expr.body,
            &self.mutation.expression_id,
            &checksum,
            &self.mutation,
            &self.dependency,
        );
    }

    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.expression_id {
            let checksum = expr.checksum();
            return add_child_style(
                &mut self.changes,
                &mut expr.body,
                &self.mutation.expression_id,
                &checksum,
                &self.mutation,
                &self.dependency,
            );
        }

        VisitorResult::Continue
    }
}

fn add_child_style(
    changes: &mut Vec<MutationResult>,
    children: &mut Vec<ast::pc::Node>,
    parent_id: &str,
    checksum: &str,
    mutation: &SetStyleDeclarations,
    dependency: &Dependency,
) -> VisitorResult<()> {
    let mut new_style: ast::pc::Style =
        parse_style(&mutation_to_style(mutation, dependency), checksum);

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
            id: format!("{}-{}", new_style.checksum(), name),
            path: vec![name.to_string()],
            range: None,
        })
        .collect::<Vec<ast::pc::Reference>>();

    let mut found = false;

    for child in children.iter_mut() {
        if let ast::pc::node::Inner::Style(style) = child.get_inner_mut() {
            if variant_combo_equals(&style.variant_combo, &new_style.variant_combo) {
                update_style(style, &new_style);
                found = true;
            }
        }
    }

    if !found {
        children.insert(0, ast::pc::node::Inner::Style(new_style).get_outer());
    }

    changes.push(
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

        buffer = format!("{}{}: {}\n", buffer, kv.name, value)
    }

    buffer = format!("{}{}", buffer, "}");

    buffer
}

fn update_style(style: &mut ast::pc::Style, new_style: &ast::pc::Style) {
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
}
