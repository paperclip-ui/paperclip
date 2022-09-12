use super::evaluator::evaluate;
use super::serializer::serialize;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;
use std::rc::Rc;

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();
            block_on(graph.load("/entry.pc", &mock_fs));
            let doc = block_on(evaluate(
                "/entry.pc",
                &graph,
                Rc::new(Box::new(|v: &str| v.to_string())),
            ))
            .unwrap();
            assert_eq!(
                strip_extra_ws(serialize(&doc).as_str()),
                strip_extra_ws($output)
            );
        }
    };
}

add_case! {
  can_eval_a_basic_style,
  [(
      "/entry.pc",
      r#"
        div {
          style {
            color: red
          }
        }
      "#,
  )],
  r#"
  .80f4925f-4 {
      color: red;
  }
  "#
}

add_case! {
  can_eval_a_basic_style_with_a_name,
  [(
      "/entry.pc",
      r#"
        span abba {
          style {
            color: orange
          }
        }
      "#,
  )],
  r#"
    .abba-80f4925f {
        color: orange;
    }
  "#
}

add_case! {
  can_extend_a_style,
  [(
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
  )],
  r#"
  .80f4925f-10 {
      font-family: Helvetica;
      font-weight: 600;
      font-weight: 300;
  }
  "#
}

add_case! {
  can_extend_multiple_styles,
  [(
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
  )],
  r#"
    .80f4925f-12 {
    color: red;
    color: orange;
    color: blue;
    }
  "#
}

add_case! {
  can_extend_an_imported_style,
  [
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
  ],
  r#"
    .80f4925f-6 {
        font-family: Helvetica;
        color: blue;
    }
  "#
}

add_case! {
  can_evaluate_a_style_with_multiple_variant_triggers,
  [(
      "/entry.pc",
      r#"
        trigger a {
          "@media screen and (max-width: 100px)"
        }
        trigger b {
          "@media screen and (max-width: 300px)"
          "@media screen and (max-width: 400px)"
          ":nth-child(2n)"
        }
        trigger c {
          "@supports mobile"
          "@supports desktop"
        }
        component A {
          variant a trigger {
            a
          }
          variant b trigger {
            b
          }
          variant c trigger {
            c
          }
          render div {
            style variant a + b + c {
              color: blue
            }
          }
        }
      "#,
  )],
  r#"
  .80f4925f-11 .80f4925f-22 {
      color: blue;
  }

  .80f4925f-13 .80f4925f-22 {
      color: blue;
  }

  .80f4925f-15 .80f4925f-22 {
      color: blue;
  }

  @supports mobile {
      @media screen and (max-width: 300px) {
          @media screen and (max-width: 100px) {
              .80f4925f-24:nth-child(2n) .80f4925f-22 {
                  color: blue;
              }
          }
      }
  }

  @supports mobile {
      @media screen and (max-width: 400px) {
          @media screen and (max-width: 100px) {
              .80f4925f-24:nth-child(2n) .80f4925f-22 {
                  color: blue;
              }
          }
      }
  }

  @supports desktop {
      @media screen and (max-width: 300px) {
          @media screen and (max-width: 100px) {
              .80f4925f-24:nth-child(2n) .80f4925f-22 {
                  color: blue;
              }
          }
      }
  }

  @supports desktop {
      @media screen and (max-width: 400px) {
          @media screen and (max-width: 100px) {
              .80f4925f-24:nth-child(2n) .80f4925f-22 {
                  color: blue;
              }
          }
      }
  }
  "#
}

add_case! {
  can_evaluate_a_style_token,
  [(
      "/entry.pc",
      r#"
      token snowWhite rgba(255, 255, 255, 0)

      div {
        style {
          color: var(snowWhite)
        }
      }

    "#,
  )],
  r#"
    :root {
        --80f4925f-7: rgba(255, 255, 255, 0);
    }

    .80f4925f-12 {
        color: var(--80f4925f-7);
    }
  "#
}

add_case! {
  adds_styles_for_text_nodes,
  [(
      "/entry.pc",
      r#"
      text abba "hello" {
        style {
          color: blue
        }
      }

    "#,
  )],
  r#"
  .abba-80f4925f { color: blue; }
  "#
}

add_case! {
  adds_styles_for_text_nodes_within_elements,
  [(
      "/entry.pc",
      r#"
      div {
        text abba "hello" {
          style {
            color: blue
          }
        }
      }

    "#,
  )],
  r#"
  .abba-80f4925f { color: blue; }
  "#
}


add_case! {
  adds_styles_for_text_nodes_within_elements2,
  [(
      "/entry.pc",
      r#"
      trigger mobile {
        "@media screen and (max-width: 100px)"
      }

      component Message {
        variant mobile trigger {
          mobile
        }
        render div {
          style variant mobile {
            gap: 14px
          }
        }
      }

    "#,
  )],
  r#"
    .80f4925f-9 { 
      gap: 14px; 
    } 
    @media screen and (max-width: 100px) { 
      .80f4925f-9 { 
        gap: 14px; 
      } 
    }
  "#
}
