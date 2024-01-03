use super::base::EditContext;
use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_proto::ast;
use paperclip_proto::ast::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::ast_mutate::SetFrameBounds;

impl MutableVisitor<()> for EditContext<SetFrameBounds> {
    fn visit_component(
        &self,
        expr: &mut ast::pc::Component,
    ) -> VisitorResult<(), EditContext<SetFrameBounds>> {
        if expr.id != self.mutation.frame_id {
            if let Some(render) = expr.get_render_expr() {
                if render.node.as_ref().expect("Node must exist").get_id() != self.mutation.frame_id
                {
                    return VisitorResult::Continue;
                }
            }
        }

        let bounds = self.mutation.bounds.as_ref().unwrap();
        let new_comment = parse_comment(
            format!(
                "/**\n * @frame(x: {}, y: {}, width: {}, height: {})\n*/",
                bounds.x, bounds.y, bounds.width, bounds.height
            )
            .trim(),
            "none",
        )
        .unwrap();

        expr.comment = Some(new_comment);
        VisitorResult::Return(())
    }
    fn visit_element(
        &self,
        expr: &mut ast::pc::Element,
    ) -> VisitorResult<(), EditContext<SetFrameBounds>> {
        if expr.id != self.mutation.frame_id {
            return VisitorResult::Continue;
        }
        let bounds = self.mutation.bounds.as_ref().unwrap();
        let new_comment = parse_comment(
            format!(
                "/**\n * @frame(x: {}, y: {}, width: {}, height: {})\n*/",
                bounds.x, bounds.y, bounds.width, bounds.height
            )
            .trim(),
            "none",
        )
        .unwrap();

        expr.comment = Some(new_comment);
        VisitorResult::Continue
    }
    fn visit_text_node(
        &self,
        expr: &mut ast::pc::TextNode,
    ) -> VisitorResult<(), EditContext<SetFrameBounds>> {
        if expr.id != self.mutation.frame_id {
            return VisitorResult::Continue;
        }
        let bounds = self.mutation.bounds.as_ref().unwrap();
        let new_comment = parse_comment(
            format!(
                "/**\n * @frame(x: {}, y: {}, width: {}, height: {})\n*/",
                bounds.x, bounds.y, bounds.width, bounds.height
            )
            .trim(),
            "none",
        )
        .unwrap();

        expr.comment = Some(new_comment);
        VisitorResult::Continue
    }
}
