use std::collections::HashMap;
use std::path::Path;

use pathdiff::diff_paths;

use super::base::EditContext;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use crate::ast::get_expr::GetExpr;
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

        for (ns, (_old_ns, path, is_new)) in get_dep_imports(&self.mutation, &self.dependency) {
            if is_new {
                let relative =
                    diff_paths(&path, Path::new(&self.dependency.path).parent().unwrap()).unwrap();
                let mut relative = relative.to_str().unwrap().to_string();

                if !relative.starts_with(".") {
                    relative = format!("./{}", relative);
                }

                let new_imp_doc = parse_pc(
                    format!("import \"{}\" as {}", relative, ns).as_str(),
                    doc.checksum().as_str(),
                )
                .unwrap();
                doc.body.insert(0, new_imp_doc.body.get(0).unwrap().clone());
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
) -> HashMap<String, (String, String, bool)> {
    let mut imports = HashMap::new();

    for decl in &mutation.declarations {
        for (key, path) in &decl.imports {
            let existing_import = dep.imports.iter().find_map(|(relative, imp_path)| {
                if imp_path == path {
                    let ns = dep
                        .document
                        .as_ref()
                        .unwrap()
                        .get_imports()
                        .iter()
                        .find(|imp| &imp.path == relative)
                        .unwrap()
                        .namespace
                        .to_string();

                    Some(ns)
                } else {
                    None
                }
            });

            if let Some(ns) = existing_import {
                imports.insert(ns.to_string(), (key.to_string(), path.to_string(), false));
            } else {
                let mut ns = "imp".to_string();
                let mut inc = 1;
                loop {
                    if matches!(
                        dep.imports
                            .iter()
                            .find(|(existing_ns, _path)| existing_ns == &&ns),
                        None
                    ) {
                        break;
                    }
                    ns = format!("imp{}", inc);
                    inc += 1;
                }
                imports.insert(ns.to_string(), (key.to_string(), path.to_string(), true));
            }
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

        for (ns, (old_ns, _path, _is_new)) in imports.iter() {
            value = value.replace(old_ns.as_str(), &ns);
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
