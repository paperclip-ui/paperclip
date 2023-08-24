use convert_case::{Case, Casing};
use paperclip_parser::pc::parser::parse;
use paperclip_proto::ast;
use paperclip_proto::ast::docco::ParameterValue;
use paperclip_proto::ast::pc::{component_body_item, Component, Element, Render, SimpleExpression};
use paperclip_proto::ast::{
    all::Expression,
    graph_ext::Dependency,
    pc::{Document, DocumentBodyItem, Node},
};
use pathdiff::diff_paths;
use regex::Regex;
use std::{collections::HashMap, fmt::Debug, path::Path};

use crate::ast::all::{Visitable, Visitor, VisitorResult};

#[macro_export]
macro_rules! replace_child {
    ($children: expr, $child_id: expr, $new_child: expr) => {{
        let mut ret = VisitorResult::Continue;
        for (_i, v) in $children.iter_mut().enumerate() {
            if v.get_id() == $child_id {
                *v = ($new_child)(v);
                // std::mem::replace(v, ($new_child)(v));
                ret = VisitorResult::Return(());
                break;
            }
        }
        ret
    }};
}
#[macro_export]
macro_rules! try_remove_child {
    ($children:expr, $id: expr) => {{
        let mut found_i = None;

        for (i, item) in $children.iter().enumerate() {
            if item.get_id() == $id {
                found_i = Some(i);
            }
        }

        if let Some(i) = found_i {
            let el = $children.remove(i);
            Some((i, el))
        } else {
            None
        }
    }};
}

struct GetNamed {
    name: String,
}

impl Visitor<String> for GetNamed {
    fn visit_slot(&mut self, expr: &paperclip_proto::ast::pc::Slot) -> VisitorResult<String> {
        if expr.name == self.name {
            return VisitorResult::Return(expr.id.to_string());
        }

        VisitorResult::Continue
    }
}

pub fn get_named_expr_id<TVisitable: Visitable + Debug>(
    name: &str,
    scope: &TVisitable,
) -> Option<String> {
    let mut imp = GetNamed {
        name: name.to_string(),
    };

    if let VisitorResult::Return(id) = scope.accept(&mut imp) {
        Some(id)
    } else {
        None
    }
}

pub fn parse_import(path: &str, ns: &str, checksum: &str) -> DocumentBodyItem {
    let new_imp_doc = parse(format!("import \"{}\" as {}", path, ns).as_str(), checksum).unwrap();

    new_imp_doc.body.get(0).unwrap().clone()
}

pub fn resolve_import(from: &str, to: &str) -> String {
    let relative = diff_paths(to, Path::new(from).parent().unwrap()).unwrap();
    let mut relative = relative.to_str().unwrap().to_string();

    if !relative.starts_with(".") {
        relative = format!("./{}", relative);
    }

    relative
}

pub fn resolve_import_ns(document_dep: &Dependency, path: &str) -> (String, bool) {
    for (rel_path, resolved_path) in &document_dep.imports {
        if resolved_path == path {
            return (
                document_dep
                    .document
                    .as_ref()
                    .unwrap()
                    .get_imports()
                    .iter()
                    .find(|imp| &imp.path == rel_path)
                    .unwrap()
                    .namespace
                    .clone(),
                false,
            );
        }
    }

    return (
        get_unique_namespace(
            "module",
            document_dep.document.as_ref().expect("Document must exist"),
        ),
        true,
    );
}

pub fn upsert_render_node<'a>(component: &'a mut Component, create_node: bool) -> &'a mut Render {
    let existing_render_node = component.body.iter_mut().position(|x| match x.get_inner() {
        component_body_item::Inner::Render(_) => true,
        _ => false,
    });

    if let Some(i) = existing_render_node {
        component
            .body
            .get_mut(i)
            .unwrap()
            .try_into()
            .expect("Must be render node")
    } else {
        component.body.push(
            component_body_item::Inner::Render(Render {
                id: component.checksum().to_string(),
                range: None,
                node: if create_node {
                    Some(parse_node(
                        "div",
                        &format!("{}-node", component.checksum().to_string()),
                    ))
                } else {
                    None
                },
            })
            .get_outer(),
        );

        component
            .body
            .last_mut()
            .unwrap()
            .try_into()
            .expect("Must be render node")
    }
}

pub fn import_dep(
    document: &mut ast::pc::Document,
    document_dep: &Dependency,
    path: &str,
) -> String {
    let ns = resolve_import_ns(document_dep, path);

    if ns.1 {
        document.body.insert(
            0,
            parse_import(
                &resolve_import(&document_dep.path, path),
                &ns.0,
                document.checksum().as_str(),
            ),
        );
    }

    return ns.0;
}

pub struct NamespaceResolution {
    pub prev: String,
    pub resolved: Option<String>,
    pub is_new: bool,
}

pub fn resolve_imports(
    namespaces: &HashMap<String, String>,
    dependency: &Dependency,
) -> HashMap<String, NamespaceResolution> {
    let mut actual_namespaces = HashMap::new();
    let document = dependency.document.as_ref().expect("Document must exist!");

    for (ns, path) in namespaces {
        if path == &dependency.path {
            actual_namespaces.insert(
                path.to_string(),
                NamespaceResolution {
                    prev: ns.to_string(),
                    resolved: None,
                    is_new: false,
                },
            );
            continue;
        }

        let rel_path =
            dependency.imports.iter().find_map(
                |(rel, abs)| {
                    if abs == path {
                        Some(rel.clone())
                    } else {
                        None
                    }
                },
            );

        if let Some(rel_path) = rel_path {
            let imports = document.get_imports();
            let imp = imports
                .iter()
                .find(|imp| imp.path == rel_path)
                .expect("Import doesn't exist!");
            actual_namespaces.insert(
                path.to_string(),
                NamespaceResolution {
                    prev: ns.to_string(),
                    resolved: Some(imp.namespace.to_string()),
                    is_new: false,
                },
            );
        } else {
            let unique_ns = get_unique_namespace(ns, document);
            actual_namespaces.insert(
                path.to_string(),
                NamespaceResolution {
                    prev: ns.to_string(),
                    resolved: Some(unique_ns.to_string()),
                    is_new: true,
                },
            );
        }
    }

    actual_namespaces
}

pub fn add_imports(
    namespaces: &HashMap<String, String>,
    document: &mut Document,
    dependency: &Dependency,
) -> HashMap<String, NamespaceResolution> {
    let actual_namespaces = resolve_imports(namespaces, dependency);

    for (path, resolution) in &actual_namespaces {
        if resolution.is_new {
            if let Some(ns) = &resolution.resolved {
                document.body.insert(
                    0,
                    parse_import(
                        &resolve_import(&dependency.path, path),
                        ns,
                        document.checksum().as_str(),
                    ),
                );
            }
        }
    }

    actual_namespaces
}

pub fn get_unique_id<CheckFn>(base: &str, is_unique: CheckFn) -> String
where
    CheckFn: Fn(&str) -> bool,
{
    let mut i = 0;
    let mut unique_id = base.to_string();

    while !(is_unique)(&unique_id) {
        i += 1;
        unique_id = format!("{}{}", base, i);
    }

    unique_id
}

pub fn get_unique_namespace(base: &str, document: &Document) -> String {
    let imports = document.get_imports();

    get_unique_id(base, |id| {
        matches!(imports.iter().find(|imp| { imp.namespace == id }), None)
    })
}

pub fn get_unique_component_name(base: &str, dep: &Dependency) -> String {
    get_unique_document_body_item_name(&get_valid_name(base, Case::Pascal), dep)
}

pub fn get_unique_document_body_item_name(base: &str, dep: &Dependency) -> String {
    let body = &dep.document.as_ref().unwrap().body;

    get_unique_id(base, |id| {
        matches!(
            body.iter()
                .find(|imp| { imp.get_name() == Some(id.to_string()) }),
            None
        )
    })
}

pub fn get_valid_name(name: &str, case: Case) -> String {
    let invalids = Regex::new("[^\\w\\s]+").unwrap();
    let invalid_start_char = Regex::new("^[^a-zA-Z]+").unwrap();
    let name = invalids.replace_all(&name, "");
    let name = invalid_start_char.replace_all(&name, "");
    name.to_case(case)
}

pub fn parse_node(source: &str, checksum: &str) -> Node {
    let child = parse(source, checksum).expect("Unable to parse child source for AppendChild");
    child.body.get(0).unwrap().clone().try_into().unwrap()
}

pub fn parse_element_attribute_value(source: &str, checksum: &str) -> SimpleExpression {
    let doc = parse(&format!("div(a: {})", source), checksum).expect("Unable to parse attribute");
    let el: Node = doc
        .body
        .get(0)
        .unwrap()
        .clone()
        .try_into()
        .expect("Cannot cast as node");

    let el: Element = el.try_into().expect("Cannot cast into el");
    el.parameters
        .get(0)
        .expect("Cannot find parameter")
        .clone()
        .value
        .expect("Value must exist")
}
