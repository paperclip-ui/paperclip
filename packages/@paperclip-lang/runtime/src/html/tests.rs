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
// TODO: evaluate slot in insert

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
                slot title {
                  text "default title"
                }
              }
              p {
                slot children {
                  text "default child"
                }
              }
            }
          }

          A {
            text "a"
            insert title {
              text "hello"
            }
            text "b"
          }
        "#,
            r#"
            <span>
                <h1>
                    default title
                </h1>
                <p>
                    default child
                </p>
            </span>
            <span>
                <h1>
                    hello
                </h1>
                <p>
                    a
                    b
                </p>
            </span>
        "#,
        ),
    ];

    for (input, output) in cases {
        let mock_fs = test_utils::MockFS::new(HashMap::from([("/entry.pc", input)]));
        let mut graph = graph::Graph::new();
        block_on(graph.load("/entry.pc", &mock_fs));
        let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
        println!("Try evaluating");
        println!("{}", serialize(&doc).trim());
        assert_eq!(serialize(&doc).trim(), dedent(output).trim());
    }

    // let mut graph = graph::Graph::new();
    // block_on(graph.load("/entry.pc", &mock_fs));
    // block_on(evaluate("/entry.pc", &graph));
}
