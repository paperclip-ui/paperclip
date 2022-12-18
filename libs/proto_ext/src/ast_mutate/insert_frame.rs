use std::collections::HashMap;

use super::base::EditContext;
use super::utils::{add_imports, NamespaceResolution};
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Document;
use paperclip_proto::{
    ast,
    ast_mutate::{mutation_result, ExpressionInserted, InsertFrame},
};

use crate::ast::all::VisitorResult;
use crate::ast::all::{MutableVisitable, MutableVisitor};
use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_parser::pc::parser::parse as parse_pc;

impl<'expr> MutableVisitor<()> for EditContext<'expr, InsertFrame> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if expr.id == self.mutation.document_id {
            let bounds = self.mutation.bounds.as_ref().unwrap();

            let imports = add_imports(&self.mutation.imports, expr, &self.dependency);

            let mut mutations = vec![];
            let checksum = expr.checksum();

            let new_comment = parse_comment(
                format!(
                    "/**\n * @bounds(x: {}, y: {}, width: {}, height: {})\n*/",
                    bounds.x, bounds.y, bounds.width, bounds.height
                )
                .trim(),
                &checksum,
            )
            .unwrap();

            let mut to_insert = parse_pc(&self.mutation.node_source, &checksum).unwrap();
            replace_namespaces(&mut to_insert, &imports);

            mutations.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: new_comment.id.to_string(),
                })
                .get_outer(),
            );

            expr.body
                .push(ast::pc::document_body_item::Inner::DocComment(new_comment).get_outer());

            for node in to_insert.body {
                mutations.push(
                    mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                        id: node.clone().get_id().to_string(),
                    })
                    .get_outer(),
                );
                expr.body.push(node.clone());
            }

            self.changes.extend(mutations);
        }

        VisitorResult::Continue
    }
}

struct NamespaceReplacer {
    old: String,
    new: Option<String>,
}

impl MutableVisitor<()> for NamespaceReplacer {
    fn visit_element(&mut self, el: &mut ast::pc::Element) -> VisitorResult<()> {
        if el.namespace.as_ref() == Some(&self.old) {
            el.namespace = self.new.clone();
        }
        VisitorResult::Continue
    }
}

fn replace_namespaces(document: &mut Document, namespaces: &HashMap<String, NamespaceResolution>) {
    for (_, resolution) in namespaces {
        let mut repl = NamespaceReplacer {
            old: resolution.prev.clone(),
            new: resolution.resolved.clone(),
        };
        document.accept(&mut repl);
    }
}
