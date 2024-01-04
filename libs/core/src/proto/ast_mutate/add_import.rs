use super::utils::import_dep;

use super::base::EditContext;
use paperclip_proto::{ast::pc::Document, ast_mutate::AddImport};

use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<AddImport> {
    fn visit_document(&self, doc: &mut Document) -> VisitorResult<(), EditContext<AddImport>> {
        let _ = import_dep(
            doc,
            &self.mutation.path,
            Some(self.mutation.ns.clone()),
            self,
        );
        VisitorResult::Return(())
    }
}
