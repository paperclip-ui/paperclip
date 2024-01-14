use std::{cell::RefCell, collections::HashMap};

use super::super::ast_mutate::utils::resolve_import_ns;
use paperclip_proto::ast::expr_map::ExprMap;
use paperclip_proto::ast::pc::{Element, Parameter, Variant};
use paperclip_proto::ast::visit::MutableVisitable;
use paperclip_proto::ast::{
    graph::Dependency,
    shared::Reference,
    visit::{MutableVisitor, VisitorResult},
    wrapper::ExpressionWrapper,
};
use std::rc::Rc;

#[derive(Clone)]
pub struct UpdateExprImports<'a> {
    expr_imports: HashMap<String, String>,
    expr_path: String,
    to_dep: &'a Dependency,

    // ns: path
    imports: Rc<RefCell<HashMap<String, String>>>,
    is_within_parameter: bool,
    expr_map: &'a ExprMap,
}

impl<'a> UpdateExprImports<'a> {
    pub fn apply(
        expr: &mut ExpressionWrapper,
        from_dep: &'a Dependency,
        to_dep: &'a Dependency,
        expr_map: &'a ExprMap,
    ) -> HashMap<String, String> {
        let mut expr_imports = HashMap::new();
        for import in from_dep
            .document
            .as_ref()
            .expect("Doc must exist")
            .get_imports()
        {
            if let Some(resolved_path) = from_dep.get_resolved_import_path(&import.namespace) {
                expr_imports.insert(import.namespace.clone(), resolved_path.clone());
            }
        }
        Self::apply2(expr, &from_dep.path, &expr_imports, to_dep, expr_map)
    }

    pub fn apply2(
        expr: &mut ExpressionWrapper,
        expr_path: &str,
        expr_imports: &HashMap<String, String>,
        to_dep: &'a Dependency,
        expr_map: &'a ExprMap,
    ) -> HashMap<String, String> {
        let imports = Rc::new(RefCell::new(HashMap::new()));

        let mut imp = UpdateExprImports {
            expr_path: expr_path.to_string(),
            expr_imports: expr_imports.clone(),
            to_dep,
            imports: imports.clone(),
            is_within_parameter: false,
            expr_map,
        };
        expr.accept(&mut imp);
        let x = imports.borrow().clone();
        x
    }
}

impl<'a> MutableVisitor<()> for UpdateExprImports<'a> {
    fn visit_element(&self, expr: &mut Element) -> VisitorResult<(), Self> {
        expr.namespace
            .as_ref()
            .and_then(|namespace| self.expr_imports.get(namespace))
            .and_then(|ns_path| resolve_import_ns(self.to_dep, ns_path, None).ok())
            .and_then(|info| {
                self.imports
                    .borrow_mut()
                    .insert(info.namespace.to_string(), info.path.to_string());
                expr.namespace = Some(info.namespace.clone());
                Some(())
            })
            .or_else(|| {
                expr.namespace = None;
                Some(())
            });

        VisitorResult::Continue
    }
    fn visit_parameter(&self, _expr: &mut Parameter) -> VisitorResult<(), Self> {
        VisitorResult::Map(Box::new(Self {
            is_within_parameter: true,
            ..self.clone()
        }))
    }
    fn visit_reference(&self, expr: &mut Reference) -> VisitorResult<(), Self> {
        if self.is_within_parameter {
            return VisitorResult::Continue;
        }

        let source = expr.follow(&self.expr_map);

        // skip style vairantse
        if matches!(source, Some(ExpressionWrapper::Variant(_))) {
            return VisitorResult::Continue;
        }

        // Dealing with local instance that needs to be updated
        if expr.path.len() == 1 {
            if let Ok(info) = resolve_import_ns(self.to_dep, &self.expr_path, None) {
                expr.path.insert(0, info.namespace.to_string());
                self.imports
                    .borrow_mut()
                    .insert(info.namespace.to_string(), self.expr_path.to_string());
            }
        } else {
            let ns = expr.path.get(0).expect("Namespace must exist");
            let name = expr.path.get(1).expect("Reference name must exist").clone();

            let ns_path = self.expr_imports.get(ns);

            ns_path
                .and_then(|ns_path| resolve_import_ns(self.to_dep, ns_path, None).ok())
                .and_then(|info| {
                    self.imports
                        .borrow_mut()
                        .insert(info.namespace.to_string(), info.path.to_string());
                    expr.path = vec![info.namespace.to_string(), name.to_string()];
                    Some(())
                })
                .or_else(|| {
                    expr.path = vec![name.to_string()];
                    Some(())
                });
        }

        VisitorResult::Continue
    }
}
