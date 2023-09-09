use super::base::EditContext;
use paperclip_proto::ast::pc::Import;
use paperclip_proto::ast_mutate::UpdateImportPath;
use pathdiff::diff_paths;
use std::path::Path;

use crate::ast::{all::MutableVisitor, all::VisitorResult};

impl MutableVisitor<()> for EditContext<UpdateImportPath> {
    fn visit_import(&mut self, import: &mut Import) -> VisitorResult<()> {
        let resolved_path = self
            .get_dependency()
            .imports
            .get(&import.path)
            .expect("Import must exist");
        if resolved_path == &self.mutation.old_path {
            let new_rel_path = diff_paths(
                self.mutation.new_path.clone(),
                Path::new(&self.get_dependency().path).parent().unwrap(),
            )
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
            import.path = new_rel_path;
            return VisitorResult::Return(());
        }
        VisitorResult::Continue
    }
}
