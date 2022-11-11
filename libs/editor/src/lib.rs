use paperclip_proto::ast::{
    self,
    all::{Expression, ImmutableExpressionRef},
};

pub enum NewNode {
    Element(ast::pc::Element),
    Text(ast::pc::TextNode),
}
