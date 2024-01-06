use paperclip_ast_serialize::serializable::Serializable;
use paperclip_parser::{core::parser_context::Options, pc::parser::parse};
use paperclip_proto::ast::{pc::Node, wrapper::Expression};

pub trait Duplicate {
    fn duplicate(&self) -> Self;
}

impl Duplicate for Node {
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
