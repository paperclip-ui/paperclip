use super::base::EditContext;
use super::utils::{create_import, parse_declaration_value, resolve_imports};
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::get_expr::GetExpr;
use paperclip_proto::ast_mutate::SetStyleDeclarationValue;

impl MutableVisitor<()> for EditContext<SetStyleDeclarationValue> {
    fn visit_atom(&self, expr: &mut ast::pc::Atom) -> VisitorResult<(), Self> {
        if expr.id != self.mutation.target_id {
            return VisitorResult::Continue;
        }

        expr.value = Some(parse_declaration_value(
            &self.mutation.value,
            &self.new_id(),
        ));

        VisitorResult::Return(())
    }

    fn visit_document(&self, doc: &mut ast::pc::Document) -> VisitorResult<(), Self> {
        if !matches!(GetExpr::get_expr(&self.mutation.target_id, doc), Some(_)) {
            return VisitorResult::Continue;
        }

        for (_, resolution) in resolve_imports(
            &self.mutation.imports,
            self.get_dependency(),
            &self.config_context,
        ) {
            if resolution.is_new {
                if let Some(ns) = &resolution.resolved {
                    doc.body.insert(
                        0,
                        create_import(&resolution.module_path, &ns, &self.new_id()),
                    );
                }
            }
        }

        VisitorResult::Continue
    }
}
