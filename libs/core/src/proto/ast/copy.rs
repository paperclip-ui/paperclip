use paperclip_ast_serialize::{docco::serialize_comment, serializable::Serializable};
use paperclip_common::serialize_context::Context as SerializeContext;
use paperclip_proto::ast::{expr_map::ExprMap, graph::Graph, wrapper::ExpressionWrapper};

use crate::config::ConfigContext;

pub fn copy_expression(expr_id: &str, graph: &Graph, config: &ConfigContext) -> String {
    let expr_map = ExprMap::from_graph(graph);

    let expr = expr_map.get_expr(expr_id).expect("Expr must exist");

    let mut ctx = SerializeContext::new(0);

    if let ExpressionWrapper::Component(component) = &expr {
        ctx.add_buffer(&format!(
            "import \"{}\" as mod\n",
            config.get_module_import_path(
                expr_map
                    .get_expr_path(&component.id)
                    .as_ref()
                    .expect("Path must exist")
            )
        ));
        if let Some(comment) = &component.comment {
            serialize_comment(comment, &mut ctx);
            ctx.add_buffer("\n");
        }

        ctx.add_buffer("mod.");
        ctx.add_buffer(&component.name);
    } else {
        ctx.add_buffer(expr.serialize(true).as_str())
    }

    ctx.buffer
}
