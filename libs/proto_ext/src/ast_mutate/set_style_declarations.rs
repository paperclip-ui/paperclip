use std::collections::HashMap;

use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::{
    mutation_result, MutationResult, SetStyleDeclarations, ExpressionUpdated,
};
use pathdiff::diff_paths;

use crate::ast::{all::Visitor, all::VisitorResult};

impl Visitor<Vec<MutationResult>> for SetStyleDeclarations {
    fn visit_style(&mut self, expr: &mut ast::pc::Style) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == self.expression_id {
            let new_style = parse_style(&mutation_to_style(&self), &expr.checksum());
            update_style(expr, &new_style);
        }
        VisitorResult::Continue
    }

    fn visit_document(&mut self, doc: &mut ast::pc::Document) -> VisitorResult<Vec<MutationResult>> {
        for decl in &mut self.declarations {
            let mut new_namespaces = HashMap::new();
            for (path, key) in &decl.imports {
                let imports = doc.get_imports();
                let existing_import = imports.iter().find(|imp| {
                    &imp.path == path
                });
                if let Some(import) = existing_import {
                    new_namespaces.insert(path.to_string(), import.namespace.to_string());
                } else {
                    let mut ns = "imp".to_string();
                    let mut inc = 1;
                    loop {
                        if matches!(imports.iter().find(|imp| imp.namespace == ns), None) {
                            break;
                        }
                        ns = format!("imp{}", inc);
                        inc += 1;
                    }
                    let new_imp_doc = parse_pc(format!("import \"{}\" as {}", path, ns).as_str(), doc.checksum().as_str()).unwrap();
                    println!("{:#?}", new_imp_doc);
                }
            }

            for (path, ns) in new_namespaces {
                if let Some(old_ns) = decl.imports.insert(path.to_string(), ns.to_string()) {
                    decl.value = decl.value.replace(&old_ns, &ns);
                }
            }
        }
        VisitorResult::Continue
    }

    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<Vec<MutationResult>> {
        if expr.get_id() == &self.expression_id {
            let new_style: ast::pc::Style = parse_style(&mutation_to_style(&self), &expr.checksum());

            let mut found = false;

            for child in &mut expr.body {
                if let ast::pc::node::Inner::Style(style) = child.get_inner_mut() {
                    update_style(style, &new_style);
                    found = true;
                }
            }

            if !found {
                expr.body.insert(0, ast::pc::node::Inner::Style(new_style).get_outer());
            }

            return VisitorResult::Return(vec![mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {

                    id: expr.id.to_string()
            }).get_outer()]);
        }

        VisitorResult::Continue
    }
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

fn mutation_to_style(mutation: &SetStyleDeclarations) -> String {
    let mut buffer = "style {\n".to_string();

    for kv in &mutation.declarations {
        buffer = format!("{}{}: {}\n", buffer, kv.name, kv.value)
    }

    buffer = format!("{}{}", buffer, "}");


    println!("{}", buffer);

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