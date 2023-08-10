use super::base::EditContext;
use paperclip_proto::ast;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::pc::{trigger_body_item, TriggerBodyItem};
use paperclip_proto::ast_mutate::{mutation_result, ExpressionUpdated, ToggleInstanceVariant};

use crate::ast::{all::MutableVisitor, all::VisitorResult};

impl<'expr> MutableVisitor<()> for EditContext<'expr, ToggleInstanceVariant> {
    fn visit_variant(&mut self, expr: &mut ast::pc::Variant) -> VisitorResult<()> {
        // if let Some(enabled) = self.mutation.enabled.get(&expr.id) {
        //     // first turn all off
        //     expr.triggers = expr
        //         .triggers
        //         .clone()
        //         .into_iter()
        //         .filter(|trigger| !matches!(trigger.get_inner(), trigger_body_item::Inner::Bool(_)))
        //         .collect::<Vec<TriggerBodyItem>>();

        //     if *enabled {
        //         expr.triggers.push(
        //             trigger_body_item::Inner::Bool(ast::base::Bool {
        //                 id: expr.checksum(),
        //                 range: None,
        //                 value: true,
        //             })
        //             .get_outer(),
        //         );
        //     }

        //     self.changes.push(
        //         mutation_result::Inner::ExpressionUpdated(ExpressionUpdated {
        //             id: expr.id.to_string(),
        //         })
        //         .get_outer(),
        //     );
        // }

        VisitorResult::Continue
    }
}
