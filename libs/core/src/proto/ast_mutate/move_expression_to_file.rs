use std::collections::HashMap;

use super::utils::{get_unique_document_body_item_name, resolve_import_ns};
use std::cell::RefCell;
use std::rc::Rc;

use super::base::EditContext;
use paperclip_common::get_or_short;
use paperclip_proto::{
    ast::pc::Element,
    ast::{
        all::{Expression, ExpressionWrapper},
        graph_ext::Dependency,
        pc::{document_body_item, Document},
        shared::Reference,
    },
    ast_mutate::{mutation, AddImport, MoveExpressionToFile},
};

use paperclip_proto::ast::all::visit::{MutableVisitable, MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_document(
        &self,
        doc: &mut Document,
    ) -> VisitorResult<(), EditContext<MoveExpressionToFile>> {
        let (expr, expr_dep) = self
            .graph
            .get_expr(&self.mutation.expression_id)
            .expect("Dep must exist");

        if self.mutation.new_file_path == self.get_dependency().path {
            let imports = insert_document_expr(doc, expr.expr, expr_dep, self.get_dependency());

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
                .position(|item| item.get_id() == expr.expr.get_id());
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
            el.get_instance_component(&self.graph),
            VisitorResult::Continue
        );

        if component.get_id() == &self.mutation.expression_id {
            let new_ns =
                resolve_import_ns(&self.get_dependency(), &self.mutation.new_file_path).namespace;
            el.namespace = Some(new_ns.clone());

            self.add_post_mutation(
                mutation::Inner::AddImport(AddImport {
                    ns: new_ns.clone(),
                    path: self.mutation.new_file_path.clone(),
                })
                .get_outer(),
            );
        }

        VisitorResult::Continue
    }

    fn visit_reference(
        &self,
        reference: &mut Reference,
    ) -> VisitorResult<(), EditContext<MoveExpressionToFile>> {
        if let Some((expr, _dep)) = reference.follow(&self.graph) {
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
                let ns = resolve_import_ns(self.get_dependency(), &self.mutation.new_file_path)
                    .namespace;

                self.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: ns.clone(),
                        path: self.mutation.new_file_path.clone(),
                    })
                    .get_outer(),
                );

                reference.path = vec![ns, unique_name];
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
) -> HashMap<String, String> {
    let mut expr = expr;

    // if inserting into doc, need to potentially rename in case there is another instance
    // with the same name.
    if let Some(unique_name) = get_expr_unique_name(&expr, new_dep) {
        expr = expr.rename(&unique_name);
    }

    let imports = UpdateExprImports::apply(&mut expr, expr_dep, new_dep);

    // TODO: should move this to TryFrom instead of having a match here
    let body_item = match expr {
        ExpressionWrapper::Component(expr) => {
            Some(document_body_item::Inner::Component(expr.clone()).get_outer())
        }
        ExpressionWrapper::Style(expr) => {
            Some(document_body_item::Inner::Style(expr.clone()).get_outer())
        }
        ExpressionWrapper::TextNode(expr) => {
            Some(document_body_item::Inner::Text(expr.clone()).get_outer())
        }
        ExpressionWrapper::Element(expr) => {
            Some(document_body_item::Inner::Element(expr.clone()).get_outer())
        }
        ExpressionWrapper::Atom(expr) => {
            Some(document_body_item::Inner::Atom(expr.clone()).get_outer())
        }
        ExpressionWrapper::Trigger(expr) => {
            Some(document_body_item::Inner::Trigger(expr.clone()).get_outer())
        }
        _ => None,
    };

    if let Some(item) = body_item {
        doc.body.push(item);
    }

    imports
}

struct UpdateExprImports<'a> {
    from_dep: &'a Dependency,
    to_dep: &'a Dependency,

    // ns: path
    imports: Rc<RefCell<HashMap<String, String>>>,
}

impl<'a> UpdateExprImports<'a> {
    fn apply(
        expr: &mut ExpressionWrapper,
        from_dep: &'a Dependency,
        to_dep: &'a Dependency,
    ) -> HashMap<String, String> {
        let imports = Rc::new(RefCell::new(HashMap::new()));

        let mut imp = UpdateExprImports {
            from_dep,
            to_dep,
            imports: imports.clone(),
        };
        expr.accept(&mut imp);
        let x = imports.borrow().clone();
        x
    }
}

impl<'a> MutableVisitor<()> for UpdateExprImports<'a> {
    fn visit_reference(&self, expr: &mut Reference) -> VisitorResult<(), UpdateExprImports<'a>> {
        // Dealing with local instance that needs to be updated
        if expr.path.len() == 1 {
            let info = resolve_import_ns(self.to_dep, &self.from_dep.path);

            expr.path.insert(0, info.namespace.to_string());
            self.imports
                .borrow_mut()
                .insert(info.namespace.to_string(), self.from_dep.path.to_string());
        } else {
            let ns = expr.path.get(0).expect("Namespace must exist");
            let name = expr.path.get(1).expect("Reference name must exist");

            let ns_path = self.from_dep.get_resolved_import_path(ns);
            if let Some(ns_path) = ns_path {
                let info = resolve_import_ns(self.to_dep, ns_path);
                self.imports
                    .borrow_mut()
                    .insert(info.namespace.to_string(), ns_path.to_string());
                expr.path = vec![info.namespace.to_string(), name.to_string()];
            }
        }

        VisitorResult::Continue
    }
}

fn get_expr_unique_name(expr: &ExpressionWrapper, to_dep: &Dependency) -> Option<String> {
    let current_name = if let Some(name) = expr.get_name() {
        name
    } else {
        return None;
    };

    return Some(get_unique_document_body_item_name(&current_name, to_dep));
}
