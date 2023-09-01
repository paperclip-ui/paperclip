use super::base::EditContext;
use super::utils::{parse_declaration_value, parse_import, resolve_import, resolve_imports};
use crate::ast::get_expr::GetExpr;
use paperclip_proto::ast;
use paperclip_proto::ast_mutate::SetStyleDeclarationValue;

use crate::ast::{all::MutableVisitor, all::VisitorResult};

impl MutableVisitor<()> for EditContext<SetStyleDeclarationValue> {
    fn visit_atom(&mut self, expr: &mut ast::pc::Atom) -> VisitorResult<()> {
        if expr.id != self.mutation.target_id {
            return VisitorResult::Continue;
        }

        expr.value = Some(parse_declaration_value(
            &self.mutation.value,
            &self.new_id(),
        ));

        VisitorResult::Return(())
    }

    fn visit_document(&mut self, doc: &mut ast::pc::Document) -> VisitorResult<()> {
        if !matches!(GetExpr::get_expr(&self.mutation.target_id, doc), Some(_)) {
            return VisitorResult::Continue;
        }

        for (path, resolution) in resolve_imports(&self.mutation.imports, self.get_dependency()) {
            if resolution.is_new {
                if let Some(ns) = &resolution.resolved {
                    let relative = resolve_import(&self.get_dependency().path, &path);
                    doc.body
                        .insert(0, parse_import(&relative, &ns, &self.new_id()));
                }
            }
        }

        VisitorResult::Continue
    }
}
