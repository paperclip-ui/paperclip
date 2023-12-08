use super::base::EditContext;
use paperclip_parser::docco::parser::parse as parse_comment;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::{MutableVisitor, VisitorResult};
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast_mutate::SetFrameBounds;

impl MutableVisitor<()> for EditContext<SetFrameBounds> {
    fn visit_component(&mut self, expr: &mut ast::pc::Component) -> VisitorResult<()> {
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
    fn visit_element(&mut self, expr: &mut ast::pc::Element) -> VisitorResult<()> {
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
    fn visit_text_node(&mut self, expr: &mut ast::pc::TextNode) -> VisitorResult<()> {
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
