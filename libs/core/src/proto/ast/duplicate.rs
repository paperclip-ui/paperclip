use paperclip_ast_serialize::serializable::Serializable;
use paperclip_parser::{core::parser_context::Options, pc::parser::parse};
use paperclip_proto::ast::{
    pc::Node,
    wrapper::{Expression, ExpressionWrapper},
};

pub trait Duplicate {
    fn duplicate(&self) -> Self;
}

macro_rules! add_duplicate {
    ($($expr: ident), *) => {
        $(
            impl Duplicate for $expr {
                fn duplicate(&self) -> Self {
                    let source = self.serialize(true);
                    parse(&source, &self.checksum(), &Options::all_experiments())
                        .expect("Cannot parse")
                        .body
                        .get(0)
                        .expect("Node must exist")
                        .clone()
                        .try_into()
                        .expect("Cannot cast to node")
                }
            }
        )*
    };
}

add_duplicate! {
    Node,
    ExpressionWrapper
}
