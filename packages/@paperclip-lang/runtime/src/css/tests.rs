use super::evaluator::evaluate;
use futures::executor::block_on;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;

#[test]
fn can_evaluate_various_sources() {
    let cases: Vec<HashMap<&str, &str>> = vec![HashMap::from([(
        "/entry.pc",
        r#"
            div {
              style {
                color: red
              }
            }
          "#,
    )])];

    for mock_files in cases {
        let mock_fs = test_utils::MockFS::new(mock_files);
        let mut graph = graph::Graph::new();
        block_on(graph.load("/entry.pc", &mock_fs));
        let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
        println!("{:?}", doc);
        panic!("fdfds");
    }

    // let mut graph = graph::Graph::new();
    // block_on(graph.load("/entry.pc", &mock_fs));
    // block_on(evaluate("/entry.pc", &graph));
}
