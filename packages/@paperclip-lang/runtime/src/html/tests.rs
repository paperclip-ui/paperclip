use super::evaluator::evaluate;
use super::serializer::serialize;
use futures::executor::block_on;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;
use textwrap::dedent;

#[test]
fn can_evaluate_various_sources() {
    let cases: Vec<(HashMap<&str, &str>, &str)> = vec![
        (
            HashMap::from([(
                "/entry.pc",
                r#"
                  div {

                  }
                "#,
            )]),
            r#"
              <div>
              </div>
              "#,
        )
    ];

    for (mock_files, expected_sheet) in cases {
        let mock_fs = test_utils::MockFS::new(mock_files);
        let mut graph = graph::Graph::new();
        block_on(graph.load("/entry.pc", &mock_fs));
        let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
        println!("{}", serialize(&doc).trim());
        assert_eq!(serialize(&doc).trim(), dedent(expected_sheet).trim());
    }

    // let mut graph = graph::Graph::new();
    // block_on(graph.load("/entry.pc", &mock_fs));
    // block_on(evaluate("/entry.pc", &graph));
}
