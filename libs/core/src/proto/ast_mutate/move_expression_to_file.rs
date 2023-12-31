use std::collections::HashMap;

use super::utils::resolve_import_ns;

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
use paperclip_proto::ast::get_expr::GetExpr;

impl MutableVisitor<()> for EditContext<MoveExpressionToFile> {
    fn visit_document(&mut self, doc: &mut Document) -> VisitorResult<()> {
        let (expr, expr_dep) =
            GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
                .expect("Dep must exist");

        if self.mutation.new_file_path == self.get_dependency().path {
            let new_imports = insert_document_expr(doc, expr, expr_dep, self.get_dependency());

            for (ns, path) in new_imports {
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
    fn visit_element(&mut self, el: &mut Element) -> VisitorResult<()> {
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

        // let ns = get_or_short!(&el.namespace, VisitorResult::Continue);
        // let el_dep = self
        //     .get_dependency()
        //     .resolve_import_from_ns(&ns, &self.graph)
        //     .expect("Import must exist");

        // let (expr, expr_dep) =
        //     GetExpr::get_expr_from_graph(&self.mutation.expression_id, &self.graph)
        //         .expect("Component must exist");

        // if component.name == el.tag_name && el_dep.path == expr_dep.path {
        //     let new_ns =
        //         resolve_import_ns(&self.get_dependency(), &self.mutation.new_file_path).namespace;
        //     el.namespace = Some(new_ns.clone());

        //     self.add_post_mutation(
        //         mutation::Inner::AddImport(AddImport {
        //             ns: new_ns.clone(),
        //             path: self.mutation.new_file_path.clone(),
        //         })
        //         .get_outer(),
        //     );
        // }

        VisitorResult::Continue
    }

    fn visit_reference(&mut self, reference: &mut Reference) -> VisitorResult<()> {
        if let Some((expr, _dep)) = reference.follow(&self.graph) {
            if expr.get_id() == &self.mutation.expression_id {
                let ns = resolve_import_ns(self.get_dependency(), &self.mutation.new_file_path)
                    .namespace;

                self.add_post_mutation(
                    mutation::Inner::AddImport(AddImport {
                        ns: ns.clone(),
                        path: self.mutation.new_file_path.clone(),
                    })
                    .get_outer(),
                );

                if reference.path.len() == 2 {
                    let _ = std::mem::replace(&mut reference.path[0], ns);
                } else if reference.path.len() == 1 {
                    reference.path.insert(0, ns);
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
) -> HashMap<String, String> {
    let mut expr = expr;
    let new_imports = UpdateExprImports::apply(&mut expr, expr_dep, new_dep);

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

    new_imports
}

struct UpdateExprImports<'a> {
    from_dep: &'a Dependency,
    to_dep: &'a Dependency,

    // ns: path
    new_imports: HashMap<String, String>,
}

impl<'a> UpdateExprImports<'a> {
    fn apply(
        expr: &mut ExpressionWrapper,
        from_dep: &'a Dependency,
        to_dep: &'a Dependency,
    ) -> HashMap<String, String> {
        let mut imp = UpdateExprImports {
            from_dep,
            to_dep,
            new_imports: HashMap::new(),
        };
        expr.accept(&mut imp);
        imp.new_imports
    }
}

impl<'a> MutableVisitor<()> for UpdateExprImports<'a> {
    fn visit_reference(&mut self, expr: &mut Reference) -> VisitorResult<()> {
        // Dealing with local instance that needs to be updated
        if expr.path.len() == 1 {
            let info = resolve_import_ns(self.to_dep, &self.from_dep.path);
            expr.path.insert(0, info.namespace.to_string());
            if info.is_new {
                self.new_imports
                    .insert(info.namespace.to_string(), self.from_dep.path.to_string());
            }
        } else {
            let ns = expr.path.get(0).expect("Namespace must exist");
            let name = expr.path.get(1).expect("Reference name must exist");

            let ns_path = self.from_dep.get_resolved_import_path(ns);
            if let Some(ns_path) = ns_path {
                let info = resolve_import_ns(self.to_dep, ns_path);
                if info.is_new {
                    self.new_imports
                        .insert(info.namespace.to_string(), ns_path.to_string());
                }

                expr.path = vec![info.namespace.to_string(), name.to_string()];
            }
            // let info = resolve_import_ns(self.to_dep, &self.from_dep.path);
        }

        VisitorResult::Continue
    }
}
