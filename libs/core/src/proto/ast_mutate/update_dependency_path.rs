use super::base::EditContext;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::css::{declaration_value, FunctionCall};
use paperclip_proto::ast::graph::Dependency;
use paperclip_proto::ast::pc::{simple_expression, Element, Import};
use paperclip_proto::ast_mutate::UpdateDependencyPath;
use pathdiff::diff_paths;
use std::path::Path;

// TODO
// use path_absolutize::*;

impl MutableVisitor<()> for EditContext<UpdateDependencyPath> {
    fn visit_dependency(&mut self, dep: &mut Dependency) -> VisitorResult<()> {
        if dep.path == self.mutation.old_path {
            dep.path = self.mutation.new_path.clone();
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, el: &mut Element) -> VisitorResult<()> {
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
                        );
                    }
                }
            }
        }

        VisitorResult::Continue
    }
    fn visit_css_function_call(&mut self, expr: &mut Box<FunctionCall>) -> VisitorResult<()> {
        if expr.name == "url" {
            for arg in &mut expr.arguments {
                if let declaration_value::Inner::Str(value) = &mut arg.get_inner_mut() {
                    if !value.value.starts_with("http") {
                        value.value = resolve_new_asset_path(
                            &value.value,
                            &self.mutation.old_path,
                            &self.mutation.new_path,
                            &self.get_dependency().path,
                        );
                    }
                }
            }
        }
        VisitorResult::Continue
    }
    fn visit_import(&mut self, import: &mut Import) -> VisitorResult<()> {
        import.path = resolve_new_asset_path(
            &import.path,
            &self.mutation.old_path,
            &self.mutation.new_path,
            &self.get_dependency().path,
        );
        VisitorResult::Continue
    }
}

fn resolve_new_asset_path(
    rel_path: &str,
    old_path: &str,
    new_path: &str,
    current_path: &str,
) -> String {
    let resolved_path = Path::new(current_path).parent().unwrap().join(rel_path);
    let resolved_path = resolved_path.as_os_str().to_str().unwrap();
    if resolved_path == old_path {
        resolve_path(current_path, new_path)
    } else if current_path == old_path {
        resolve_path(new_path, resolved_path)
    } else {
        rel_path.to_string()
    }
}

fn resolve_path(from: &str, to: &str) -> String {
    diff_paths(to, Path::new(&from).parent().unwrap())
        .unwrap()
        .to_str()
        .unwrap()
        .to_string()
}
