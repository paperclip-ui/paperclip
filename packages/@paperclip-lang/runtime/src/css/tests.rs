use super::evaluator::evaluate;
use super::serialize::serialize;
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
                    style {
                      color: red
                    }
                  }
                "#,
            )]),
            r#"
              .80f4925f-4 {
                  color: red;
              }
              "#,
        ),
        (
            HashMap::from([(
                "/entry.pc",
                r#"
                  span abba {
                    style {
                      color: orange
                    }
                  }
                "#,
            )]),
            r#"
              .abba-80f4925f {
                  color: orange;
              }
              "#,
        ),
        // style extends. Note that we want to keep previous props
        // just in case any value is !important
        (
            HashMap::from([(
                "/entry.pc",
                r#"
                style fontRegular {
                  font-family: Helvetica
                  font-weight: 600
                }

                div {
                  style extends fontRegular {
                    font-weight: 300
                  }
                }
              "#,
            )]),
            r#"
            .80f4925f-10 {
                font-family: Helvetica;
                font-weight: 600;
                font-weight: 300;
            }
            "#,
        ),
        (
            HashMap::from([(
                "/entry.pc",
                r#"
                  style a {
                    color: red
                  }
                  style b {
                    color: orange
                  }

                  div {
                    style extends a, b {
                      color: blue
                    }
                  }
                "#,
            )]),
            r#"
          .80f4925f-12 {
              color: red;
              color: orange;
              color: blue;
          }
          "#,
        ),
        (
            HashMap::from([
                (
                    "/styles.pc",
                    r#"
                      public style fontRegular {
                        font-family: Helvetica
                      }
                    "#,
                ),
                (
                    "/entry.pc",
                    r#"
                      import "/styles.pc" as styles
                      div {
                        style extends styles.fontRegular {
                          color: blue
                        }
                      }
                    "#,
                ),
            ]),
            r#"
        .80f4925f-6 {
            font-family: Helvetica;
            color: blue;
        }
        "#,
        ),
        (
            HashMap::from([(
                "/entry.pc",
                r#"
                  component A {
                    render div blarg {
                      style {
                        color: blue
                      }
                    }
                  }
                "#,
            )]),
            r#"
              .A-blarg-80f4925f {
                  color: blue;
              }
              "#,
        ),
    ];

    for (mock_files, expected_sheet) in cases {
        let mock_fs = test_utils::MockFS::new(mock_files);
        let mut graph = graph::Graph::new();
        block_on(graph.load("/entry.pc", &mock_fs));
        let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
        assert_eq!(serialize(&doc).trim(), dedent(expected_sheet).trim());
    }

    // let mut graph = graph::Graph::new();
    // block_on(graph.load("/entry.pc", &mock_fs));
    // block_on(evaluate("/entry.pc", &graph));
}
