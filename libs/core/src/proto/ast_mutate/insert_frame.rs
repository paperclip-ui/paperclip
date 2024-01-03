use std::collections::HashMap;

use super::base::EditContext;
use super::utils::{add_imports, NamespaceResolution};
use paperclip_proto::ast::pc::Document;
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::{
    ast,
    ast_mutate::{mutation_result, ExpressionInserted, InsertFrame},
};

use paperclip_parser::core::parser_context::Options;
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast::visit::{MutableVisitable, MutableVisitor, VisitorResult};

impl MutableVisitor<()> for EditContext<InsertFrame> {
    fn visit_document(
        &self,
        expr: &mut ast::pc::Document,
    ) -> VisitorResult<(), EditContext<InsertFrame>> {
        if expr.id == self.mutation.document_id {
            let bounds = self.mutation.bounds.as_ref().unwrap();

            let imports = add_imports(&self.mutation.imports, expr, &self);

            let mut mutations = vec![];

            let mut to_insert = parse_pc(
                format!(
                    "
                /**\n * @frame(x: {}, y: {}, width: {}, height: {})\n*/
                {}
                ",
                    bounds.x, bounds.y, bounds.width, bounds.height, &self.mutation.node_source
                )
                .as_str(),
                &self.new_id(),
                &Options::new(vec![]),
            )
            .unwrap();
            replace_namespaces(&mut to_insert, &imports);

            for node in to_insert.body {
                mutations.push(
                    mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                        id: node.clone().get_id().to_string(),
                    })
                    .get_outer(),
                );
                expr.body.push(node.clone());
            }

            self.add_changes(mutations);
        }

        VisitorResult::Continue
    }
}

struct NamespaceReplacer {
    old: String,
    new: Option<String>,
}

impl MutableVisitor<()> for NamespaceReplacer {
    fn visit_element(&self, el: &mut ast::pc::Element) -> VisitorResult<(), NamespaceReplacer> {
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
