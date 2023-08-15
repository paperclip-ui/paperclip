use super::base::EditContext;
use super::utils::{parse_node, get_unique_document_body_item_name};
use paperclip_parser::pc::parser::parse as parse_pc;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::Node;
use paperclip_proto::ast_mutate::{mutation_result, ExpressionInserted, PrependChild};

use crate::ast::all::MutableVisitor;
use crate::ast::all::VisitorResult;

// #[macro_export]
// macro_rules! set_unique_id {
//     ($children: expr, $child_id: expr, $new_child: expr) => {{
//         let mut ret = VisitorResult::Continue;
//         for (_i, v) in $children.iter_mut().enumerate() {
//             if v.get_id() == $child_id {
//                 *v = ($new_child)(v);
//                 // std::mem::replace(v, ($new_child)(v));
//                 ret = VisitorResult::Return(());
//                 break;
//             }
//         }
//         ret
//     }};
// }


impl<'expr> MutableVisitor<()> for EditContext<'expr, PrependChild> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.parent_id {
            let child = parse_pc(&self.mutation.child_source, &expr.checksum())
                .expect("Unable to parse child source for AppendChild");
            let mut child = child.body.get(0).unwrap().clone();

            child.set_name(&get_unique_document_body_item_name(&child.get_name().unwrap_or("unnamed".to_string()), &self.get_dependency()));

            self.changes.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );

            expr.body.insert(0, child);
        }
        VisitorResult::Continue
    }
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
        if expr.get_id() == &self.mutation.parent_id {
            let child: Node = parse_node(&self.mutation.child_source, &expr.checksum());
            expr.body.insert(0, child.clone());

            self.changes.push(
                mutation_result::Inner::ExpressionInserted(ExpressionInserted {
                    id: child.get_id().to_string(),
                })
                .get_outer(),
            );
        }
        VisitorResult::Continue
    }
}
