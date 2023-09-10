use super::base::EditContext;
use paperclip_proto::ast::graph::Dependency;
use paperclip_proto::ast::pc::{Document, Import};
use paperclip_proto::ast_mutate::UpdateDependencyPath;
use pathdiff::diff_paths;
use std::path::Path;

use crate::ast::{all::MutableVisitor, all::VisitorResult};

impl MutableVisitor<()> for EditContext<UpdateDependencyPath> {
    fn visit_dependency(&mut self, dep: &mut Dependency) -> VisitorResult<()> {
        println!("OKOKO");
        if dep.path == self.mutation.old_path {
            dep.path = self.mutation.new_path.clone();
        }
        VisitorResult::Continue
    }
    fn visit_document(&mut self, doc: &mut Document) -> VisitorResult<()> {
        println!("OKOK");
        VisitorResult::Continue
    }
    fn visit_import(&mut self, import: &mut Import) -> VisitorResult<()> {
        let resolved_path = self
            .get_dependency()
            .imports
            .get(&import.path)
            .expect("Import must exist");

        if self.get_dependency().path == self.mutation.old_path {
            let new_rel_path = diff_paths(
                resolved_path,
                Path::new(&self.mutation.new_path).parent().unwrap(),
            )
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
            import.path = new_rel_path;
        } else if resolved_path == &self.mutation.old_path {
            let new_rel_path = diff_paths(
                self.mutation.new_path.clone(),
                Path::new(&self.get_dependency().path).parent().unwrap(),
            )
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
            import.path = new_rel_path;
        }
        VisitorResult::Continue
    }
}
