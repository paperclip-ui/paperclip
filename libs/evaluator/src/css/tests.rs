use super::evaluator::evaluate;
use super::serializer::serialize;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;

struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, _to: &str) -> Option<String> {
        Some(_to.to_string())
    }
}

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = graph::Graph::new();

            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }
            let resolver = MockResolver {};
            let doc = block_on(evaluate("/entry.pc", &graph, &resolver)).unwrap();
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
  ._80f4925f-4 {
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
    ._abba-80f4925f-4 {
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
  ._80f4925f-10 {
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
    ._80f4925f-12 {
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
    ._80f4925f-6 {
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
  ._A-80f4925f-22._a-80f4925f-11 {
      color: blue;
  }

  ._A-80f4925f-22._b-80f4925f-13 {
      color: blue;
  }

  ._A-80f4925f-22._c-80f4925f-15 {
      color: blue;
  }

  @supports mobile {
      @media screen and (max-width: 300px) {
          @media screen and (max-width: 100px) {
              ._A-80f4925f-22:nth-child(2n) {
                  color: blue;
              }
          }
      }
  }

  @supports mobile {
      @media screen and (max-width: 400px) {
          @media screen and (max-width: 100px) {
              ._A-80f4925f-22:nth-child(2n) {
                  color: blue;
              }
          }
      }
  }

  @supports desktop {
      @media screen and (max-width: 300px) {
          @media screen and (max-width: 100px) {
              ._A-80f4925f-22:nth-child(2n) {
                  color: blue;
              }
          }
      }
  }

  @supports desktop {
      @media screen and (max-width: 400px) {
          @media screen and (max-width: 100px) {
              ._A-80f4925f-22:nth-child(2n) {
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
        --snowWhite-80f4925f-7: rgba(255, 255, 255, 0);
    }

    ._80f4925f-12 {
        color: var(--snowWhite-80f4925f-7);
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
  ._abba-80f4925f-4 { color: blue; }
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
  ._abba-80f4925f-4 { color: blue; }
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
  ._Message-80f4925f-9._mobile-80f4925f-4 { 
      gap: 14px; 
    } 
    @media screen and (max-width: 100px) { 
      ._Message-80f4925f-9 { 
        gap: 14px; 
      } 
    }
  "#
}

add_case! {
  add_variant_info_for_nested_elements,
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
          span {
            style variant mobile {
              color: orange
            }
          }
        }
      }

    "#,
  )],
  r#"
  ._Message-80f4925f-10._mobile-80f4925f-4 ._Message-80f4925f-9 { 
    color: orange;
    } 
    @media screen and (max-width: 100px) { 
      ._Message-80f4925f-10 ._Message-80f4925f-9 { 
        color: orange;
      } 
    }
  "#
}
