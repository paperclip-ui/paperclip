use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use futures::executor::block_on;
use std::collections::HashMap;
use super::evaluator::evaluate;

#[test]
fn can_evaluate_a_simple_rule() {

    let mock_fs = test_utils::MockFS::new(HashMap::from([
        (
            "/entry.pc",
            r#"
              div {
                style {
                  color: red
                }
              }
            "#,
        )
    ]));


    let mut graph = graph::Graph::new();
    block_on(graph.load("/entry.pc", &mock_fs));
    block_on(evaluate("/entry.pc", &graph));
    panic!("fd");
}
