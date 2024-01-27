use std::collections::HashMap;

use crate::proto::ast::update_expr_imports::UpdateExprImports;

use super::utils::{get_unique_document_body_item_name, resolve_import_ns};

use super::base::EditContext;
use paperclip_common::get_or_short;
use paperclip_proto::ast::expr_map::ExprMap;
use paperclip_proto::{
    ast::pc::Element,
    ast::{
        graph_ext::Dependency,
        pc::Document,
        shared::Reference,
        wrapper::{Expression, ExpressionWrapper},
    },
    ast_mutate::{mutation, AddImport, MoveExpressionToFile},
};

use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_document(
        &self,
        doc: &mut Document,
    ) -> VisitorResult<(), EditContext<MoveExpressionToFile>> {
        let expr = self
            .expr_map
            .get_expr(&self.mutation.expression_id)
            .expect("Dep must exist");

        let expr_path = self
            .expr_map
            .get_expr_path(&self.mutation.expression_id)
            .expect("Dep must exist");
        let expr_dep = self
            .graph
            .dependencies
            .get(expr_path)
            .expect("Dep must exist");

        if self.mutation.new_file_path == self.get_dependency().path {
            let imports = insert_document_expr(
                doc,
                expr.clone(),
                expr_dep,
                self.get_dependency(),
                &self.expr_map,
            );

            for (ns, path) in imports {
                self.add_post_mutation(
                    mutation::Inner::AddImport(AddImport { ns, path }).get_outer(),
                );
            }
            VisitorResult::Continue
        } else if expr_dep.path == self.get_dependency().path {
            let i = doc
                .body
                .iter()
                .position(|item| item.get_id() == expr.get_id());
            if let Some(i) = i {
                doc.body.remove(i);
            }
            VisitorResult::Continue
        } else {
            VisitorResult::Continue
        }
    }

    // check for Instances
    fn visit_element(
        &self,
        el: &mut Element,
    ) -> VisitorResult<(), EditContext<MoveExpressionToFile>> {
        let component = get_or_short!(
            el.get_instance_component(&self.expr_map),
            VisitorResult::Continue
        );

        if component.get_id() == &self.mutation.expression_id {
            el.namespace =
                resolve_import_ns(&self.get_dependency(), &self.mutation.new_file_path, None)
                    .ok()
                    .and_then(|info| {
                        self.add_post_mutation(
                            mutation::Inner::AddImport(AddImport {
                                ns: info.namespace.clone(),
                                path: self.mutation.new_file_path.clone(),
                            })
                            .get_outer(),
                        );
                        Some(info.namespace.clone())
                    });
        }

        VisitorResult::Continue
    }

    fn visit_reference(
        &self,
        reference: &mut Reference,
    ) -> VisitorResult<(), EditContext<MoveExpressionToFile>> {
        if let Some(expr) = reference.follow(&self.expr_map) {
            if expr.get_id() != &self.mutation.expression_id {
                return VisitorResult::Continue;
            }

            let to_dep = self
                .graph
                .dependencies
                .get(&self.mutation.new_file_path)
                .expect("Dep must exist!");

            // Expect here otherwise it's a bug. Likely a missing match statement
            let unique_name = get_expr_unique_name(&expr, to_dep).expect("Name must be present");

            // if moving to THIS file, the want to strip away the namespace
            if self.mutation.new_file_path == self.get_dependency().path {
                reference.path = vec![unique_name];

            // otherwise we should update it
            } else {
                if let Ok(info) =
                    resolve_import_ns(self.get_dependency(), &self.mutation.new_file_path, None)
                {
                    self.add_post_mutation(
                        mutation::Inner::AddImport(AddImport {
                            ns: info.namespace.clone(),
                            path: self.mutation.new_file_path.clone(),
                        })
                        .get_outer(),
                    );

                    reference.path = vec![info.namespace, unique_name];
                }
            }
        }
        VisitorResult::Continue
    }
}

fn insert_document_expr(
    doc: &mut Document,
    expr: ExpressionWrapper,
    expr_dep: &Dependency,
    new_dep: &Dependency,
    expr_map: &ExprMap,
) -> HashMap<String, String> {
    let mut expr = expr;

    // if inserting into doc, need to potentially rename in case there is another instance
    // with the same name.
    if let Some(unique_name) = get_expr_unique_name(&expr, new_dep) {
        expr = expr.rename(&unique_name);
    }

    let imports = UpdateExprImports::apply(&mut expr, expr_dep, new_dep, expr_map);

    // TODO: should move this to TryFrom instead of having a match here

    if let Ok(item) = expr.try_into() {
        doc.body.push(item);
    }

    imports
}

fn get_expr_unique_name(expr: &ExpressionWrapper, to_dep: &Dependency) -> Option<String> {
    let current_name = if let Some(name) = expr.get_name() {
        name
    } else {
        return None;
    };

    return Some(get_unique_document_body_item_name(
        expr.get_id(),
        &current_name,
        to_dep.document.as_ref().expect("Document must exist"),
    ));
}
