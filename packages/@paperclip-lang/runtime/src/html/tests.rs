use super::evaluator::evaluate;
use super::serializer::serialize;
use futures::executor::block_on;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;
use textwrap::dedent;

// TODO: ensure no infinite loop
// TODO: check imported instances
// TODO: slots & inserts

#[test]
fn can_evaluate_various_sources() {
    let cases: Vec<(&str, &str)> = vec![
        // text
        (
            r#"
              div
            "#,
            r#"
              <div>
              </div>
            "#,
        ),
        (
            r#"
              text "hello"
            "#,
            r#"
              hello
            "#,
        ),
        (
            r#"
              div (a: "b", c: "d")
            "#,
            r#"
              <div a="b" c="d">
              </div>
            "#,
        ),
        // component
        (
            r#"
              component A {
                render div {
                  text "Hello world"
                }
              }
            "#,
            r#"
              <div>
                  Hello world
              </div>
            "#,
        ),
        // void tags
        (
            r#"
              br
              hr
            "#,
            r#"
              <br>
              <hr>
            "#,
        ),
        // render instances
        //   (
        //     r#"
        //       component A {
        //         render span
        //       }

        //       A
        //     "#,
        //     r#"
        //       <span>
        //       </span>
        //       <span>
        //       </span>
        //     "#,
        // ),

        // render slots
        (
            r#"
          component A {
            render span {
              h1 {
                
              }
              p {
                slot children
              }
            }
          }

          A {
            text "hello world"
            insert another 
          }
        "#,
            r#"
          <span>
          </span>
          <span>
            hello world
          </span>
        "#,
        ),
    ];

    for (input, output) in cases {
        let mock_fs = test_utils::MockFS::new(HashMap::from([("/entry.pc", input)]));
        let mut graph = graph::Graph::new();
        block_on(graph.load("/entry.pc", &mock_fs));
        let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
        println!("{}", serialize(&doc).trim());
        // assert_eq!(serialize(&doc).trim(), dedent(output).trim());
    }

    // let mut graph = graph::Graph::new();
    // block_on(graph.load("/entry.pc", &mock_fs));
    // block_on(evaluate("/entry.pc", &graph));
}
