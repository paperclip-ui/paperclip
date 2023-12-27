use std::collections::HashMap;

use paperclip_common::fs::FileResolver;
use paperclip_evaluator::core::io::PCFileResolver;
use paperclip_proto::{ast::graph, notice::base::{NoticeResult, Notice}};
use futures::executor::block_on;
use paperclip_proto_ext::graph::test_utils;
use paperclip_proto_ext::graph::load::LoadableGraph;
use paperclip_parser::core::parser_context::Options as ParserOptions;
use anyhow::Result;

use crate::lint::{lint_document};

#[derive(Clone)]
struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, to: &str) -> Result<String> {
        Ok(to.to_string())
    }
}


fn lint_doc(sources: HashMap<&str, &str>) -> NoticeResult {
    let mock_fs = test_utils::MockFS::new(sources);
    let mut graph = graph::Graph::new();
    if let Err(_err) = block_on(graph.load(
        "/entry.pc",
        &mock_fs,
        ParserOptions::new(vec![
            "repeat".to_string(),
            "switch".to_string(),
            "condition".to_string(),
        ]),
    )) {
        panic!("Unable to load");
    }
    let resolver = MockResolver {};
    let pc_resolver = PCFileResolver::new(mock_fs.clone(), resolver.clone(), None);
    lint_document(
        "/entry.pc",
        &graph
    )
}

macro_rules! add_case {
    ($name: ident, $input: expr, $output: expr) => {
        #[test]
        fn $name() {
            let result = lint_doc(HashMap::from($input));
            println!("Try evaluating");
            println!("{:#?}", result);
            assert_eq!(
                result,
                $output
            );
        }
    };
}

add_case! {
    can_lint_a_simple_element,
    [("/entry.pc", "div")],
    NoticeResult {
        notices: vec![]
    }
}
