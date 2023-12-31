use crate::config::ConfigContext;

use super::base::EditContext;
use paperclip_common::path::absolutize;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::css::{declaration_value, FunctionCall};
use paperclip_proto::ast::graph::Dependency;
use paperclip_proto::ast::pc::{simple_expression, Element, Import};
use paperclip_proto::ast_mutate::UpdateDependencyPath;
use std::path::Path;

// TODO
// use path_absolutize::*;

impl MutableVisitor<()> for EditContext<UpdateDependencyPath> {
    fn visit_dependency(&self, dep: &mut Dependency) -> VisitorResult<(), Self> {
        if dep.path == self.mutation.old_path {
            dep.path = self.mutation.new_path.clone();
        }
        VisitorResult::Continue
    }
    fn visit_element(&self, el: &mut Element) -> VisitorResult<(), Self> {
        for param in &mut el.parameters {
            if param.name == "src" {
                if let simple_expression::Inner::Str(value) = param
                    .value
                    .as_mut()
                    .expect("Value must exist")
                    .get_inner_mut()
                {
                    if !value.value.starts_with("http") {
                        value.value = resolve_new_asset_path(
                            &value.value,
                            &self.mutation.old_path,
                            &self.mutation.new_path,
                            &self.get_dependency().path,
                            &self.config_context,
                        );
                    }
                }
            }
        }

        VisitorResult::Continue
    }
    fn visit_css_function_call(&self, expr: &mut Box<FunctionCall>) -> VisitorResult<(), Self> {
        if expr.name == "url" {
            for arg in &mut expr.arguments {
                if let declaration_value::Inner::Str(value) = &mut arg.get_inner_mut() {
                    if !value.value.starts_with("http") {
                        value.value = resolve_new_asset_path(
                            &value.value,
                            &self.mutation.old_path,
                            &self.mutation.new_path,
                            &self.get_dependency().path,
                            &self.config_context,
                        );
                    }
                }
            }
        }
        VisitorResult::Continue
    }
    fn visit_import(&self, import: &mut Import) -> VisitorResult<(), Self> {
        import.path = resolve_new_asset_path(
            &import.path,
            &self.mutation.old_path,
            &self.mutation.new_path,
            &self.get_dependency().path,
            &self.config_context,
        );
        VisitorResult::Continue
    }
}

fn resolve_new_asset_path(
    current_import_rel_path: &str,
    old_path: &str,
    new_path: &str,
    module_path: &str,
    config_context: &ConfigContext,
) -> String {
    let import_abs_path = resolve_import_path(module_path, current_import_rel_path, config_context);

    // this module is moved
    if module_path == old_path {
        // just resolve from config. This may be a no-op, and that's fine.
        config_context.get_module_import_path(&import_abs_path)

    // an asset is moved
    } else if import_abs_path == old_path {
        config_context.get_module_import_path(new_path)
    } else {
        current_import_rel_path.to_string()
    }
}

fn resolve_import_path(from: &str, to: &str, config_context: &ConfigContext) -> String {
    config_context.resolve_path(to).unwrap_or(
        absolutize(Path::new(from).parent().unwrap().join(to))
            .to_str()
            .unwrap()
            .to_string(),
    )
}
