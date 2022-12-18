use std::{fmt::Debug, path::Path, collections::HashMap};

use paperclip_parser::pc::parser::parse;
use paperclip_proto::ast::{pc::{DocumentBodyItem, Document}, graph_ext::Dependency, all::Expression};
use pathdiff::diff_paths;

use crate::ast::all::{Visitable, Visitor, VisitorResult};

#[macro_export]
macro_rules! replace_child {
    ($children: expr, $child_id: expr, $new_child: expr) => {{
        let mut ret = VisitorResult::Continue;
        for (i, v) in $children.iter_mut().enumerate() {
            if v.get_id() == $child_id {
                std::mem::replace(v, ($new_child)(v));
                ret = VisitorResult::Return(());
                break;
            }
        }
        ret
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

    let new_imp_doc = parse(
        format!("import \"{}\" as {}", path, ns).as_str(),
        checksum,
    )
    .unwrap();

    new_imp_doc.body.get(0).unwrap().clone()
}

pub fn resolve_import(from: &str, to: &str) -> String {
    let relative =
    diff_paths(to, Path::new(from).parent().unwrap()).unwrap();
    let mut relative = relative.to_str().unwrap().to_string();

    if !relative.starts_with(".") {
        relative = format!("./{}", relative);
    }

    relative
}

pub struct NamespaceResolution {
    pub prev: String,
    pub resolved: Option<String>,
    pub is_new: bool
}


pub fn resolve_imports(namespaces: &HashMap<String, String>, dependency: &Dependency) -> HashMap<String, NamespaceResolution> {
    let mut actual_namespaces = HashMap::new();
    let document = dependency.document.as_ref().expect("Document must exist!");

    for (ns, path) in namespaces {
        if path == &dependency.path {
            actual_namespaces.insert(path.to_string(), NamespaceResolution { prev:  ns.to_string(), resolved: None, is_new: false });
            continue
        }

        let rel_path = dependency.imports.iter().find_map(|(rel, abs)| {
            if abs == path {
                Some(rel.clone())
            } else {
                None
            }
        });

        if let Some(rel_path) = rel_path {
            let imports = document.get_imports();
            let imp = imports.iter().find(|imp| {
                imp.path == rel_path
            }).expect("Import doesn't exist!");
            actual_namespaces.insert(path.to_string(), NamespaceResolution {
                prev: ns.to_string(),
                resolved: Some(imp.namespace.to_string()),
                is_new: false
            });

        } else {
            let unique_ns = get_unique_namespace(ns, document);
            actual_namespaces.insert(path.to_string(), NamespaceResolution { prev: ns.to_string(), resolved: Some(unique_ns.to_string()), is_new: true });
        }
    }

    actual_namespaces
}


pub fn add_imports(namespaces: &HashMap<String, String>, document: &mut Document, dependency: &Dependency) -> HashMap<String, NamespaceResolution> {
    let mut actual_namespaces = resolve_imports(namespaces, dependency);

    for (path, resolution) in &actual_namespaces {
        if resolution.is_new {
            if let Some(ns) = &resolution.resolved {
                document.body.insert(0, parse_import(&resolve_import(&dependency.path, path), ns, document.checksum().as_str()));
            }
        }
    }

    actual_namespaces
}

pub fn get_unique_namespace(base: &str, document: &Document) -> String {
    let mut i = 0;
    let mut unique_ns = base.to_string();
    let imports = document.get_imports();

    while matches!(imports.iter().find(|imp| {
        imp.namespace == unique_ns
    }), Some(_)) {
        i += 1;
        unique_ns = format!("{}{}", base, i);
    }

    unique_ns
}
