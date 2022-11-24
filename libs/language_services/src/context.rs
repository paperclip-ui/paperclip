use paperclip_proto::ast::graph_ext::Graph;

use paperclip_proto::language_service::pc::{DocumentInfo, Position};

#[derive(Clone)]
pub struct Context<'graph> {
    pub path: String,
    pub graph: &'graph Graph,
    pub info: DocumentInfo,
    pub source_position: Option<Position>,
}

impl<'graph> Context<'graph> {
    pub fn with_source_position(self, position: Position) -> Self {
        Self {
            source_position: Some(position),
            info: DocumentInfo { colors: vec![] },
            ..self
        }
    }
    pub fn extend(&mut self, ctx: Context) {
        self.info.colors.extend(ctx.info.colors);
    }
}
