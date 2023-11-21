use super::evaluator::evaluate;
use super::serializer::serialize;
use crate::core::io::PCFileResolver;
use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto_ext::graph::{load::LoadableGraph, test_utils};
use std::collections::HashMap;

#[derive(Clone)]
struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, _to: &str) -> Result<String> {
        Ok(_to.to_string())
    }
}

macro_rules! add_case {
    ($name: ident, $mock_files: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($mock_files));
            let mut graph = Graph::new();

            if let Err(_err) = block_on(graph.load(
                "/entry.pc",
                &mock_fs,
                Options::new(vec![
                    "repeat".to_string(),
                    "switch".to_string(),
                    "condition".to_string(),
                ]),
            )) {
                panic!("Unable to load");
            }
            let resolver = PCFileResolver::new(mock_fs.clone(), MockResolver {}, None);

            let doc = block_on(evaluate("/entry.pc", &graph, &resolver)).unwrap();

            // for debugging
            // for (path, _content) in $mock_files {
            //   let doc = block_on(evaluate(path, &graph, &resolver)).unwrap();

            //     println!("{}: {}", path, serialize(&doc));
            // }
            
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
  :root {
    --fontRegular-font-family-80f4925f-2: Helvetica;
    --fontRegular-font-weight-80f4925f-4: 600;
  }

  ._80f4925f-10 {
      font-family:  var(--fontRegular-font-family-80f4925f-2);
      font-weight:  var(--fontRegular-font-weight-80f4925f-4);
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
    :root {
      --a-color-80f4925f-2: red;
      --b-color-80f4925f-5: orange;
    }

    ._80f4925f-12 {
    color: var(--a-color-80f4925f-2);
    color: var(--b-color-80f4925f-5);
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
        font-family: var(--fontRegular-font-family-cfd9c7f-2);
        color: blue;
    }
  "#
}

add_case! {
  can_evaluate_a_style_with_multiple_variant_triggers,
  [(
      "/entry.pc",
      r#"
        trigger a1 {
          "@media screen and (max-width: 100px)"
        }
        trigger b1 {
          "@media screen and (max-width: 300px)"
          "@media screen and (max-width: 400px)"
          ":nth-child(2n)"
        }
        trigger c1 {
          "@supports mobile"
          "@supports desktop"
        }
        component A {
          variant a trigger {
            a1
          }
          variant b trigger {
            b1
          }
          variant c trigger {
            c1
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

  ._A-80f4925f-31._variant-80f4925f-18._variant-80f4925f-21._variant-80f4925f-24 {
    color: blue;
  }

  @supports mobile {
    @media screen and (max-width: 300px) {
      @media screen and (max-width: 100px) {
        ._A-80f4925f-31 {
          color: blue;
        }
      }
    }
  }
  @supports mobile {
    @media screen and (max-width: 400px) {
      @media screen and (max-width: 100px) {
        ._A-80f4925f-31 {
          color: blue;
        }
      }
    }
  }

  @supports mobile {
    @media screen and (max-width: 100px) {
      ._A-80f4925f-31:nth-child(2n) {
        color: blue;
      }
    }
  }

  @supports desktop {
    @media screen and (max-width: 300px) {
      @media screen and (max-width: 100px) {
        ._A-80f4925f-31 {
          color: blue;
        }
      }
    }
  }

  @supports desktop {
    @media screen and (max-width: 400px) {
      @media screen and (max-width: 100px) {
        ._A-80f4925f-31 {
          color: blue;
        }
      }
    }
  }

  @supports desktop {
    @media screen and (max-width: 100px) {
      ._A-80f4925f-31:nth-child(2n) {
        color: blue;
      }
    }
  }
  "#
}

add_case! {
  can_define_an_element_trigger,
  [
      ("/entry.pc", r#"

       component A {
         variant everyOther trigger { ":nth-child(2n)" }
         render div {
            style variant everyOther {
              color: blue
            }
         }
       }
      "#)
  ],
  r#"

  ._A-80f4925f-8._variant-80f4925f-3 {
    color: blue;
  }

  ._A-80f4925f-8:nth-child(2n) {
    color: blue;
  }
  "#
}

add_case! {
  can_trigger_a_variant_style,
  [
      ("/entry.pc", r#"

       component A {
         variant isMobile trigger { true }
         render div {
            style variant isMobile {
              color: blue
            }
         }
       }
      "#)
  ],
  r#"
  ._A-80f4925f-8._variant-80f4925f-3 { color: blue; }
  ._A-80f4925f-8 { color: blue; }
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
      trigger mobile2 {
        "@media screen and (max-width: 100px)"
      }

      component Message {
        variant mobile trigger {
          mobile2
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
  ._Message-80f4925f-11._variant-80f4925f-6 {
      gap: 14px;
    }
    @media screen and (max-width: 100px) {
      ._Message-80f4925f-11 {
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
      trigger mobile2 {
        "@media screen and (max-width: 100px)"
      }

      component Message {
        variant mobile trigger {
          mobile2
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
  ._Message-80f4925f-12._variant-80f4925f-6 ._Message-80f4925f-11 {
    color: orange;
    }
    @media screen and (max-width: 100px) {
      ._Message-80f4925f-12 ._Message-80f4925f-11 {
        color: orange;
      }
    }
  "#
}

add_case! {
  can_add_space_after_declarations,
  [(
      "/entry.pc",
      r#"

style fontRegular {
  font-family: Helvetica
}

div {
  style extends fontRegular {}
}
    "#,
  )],
  r#"
  :root { --fontRegular-font-family-80f4925f-2: Helvetica; }
  ._80f4925f-6 { font-family: var(--fontRegular-font-family-80f4925f-2); }
  "#
}

add_case! {
  can_evaluate_styles_without_bodies,
  [(
      "/entry.pc",
      r#"

style a {
  font-family: Helvetica
}

style b {
  color: red
}

style c extends a, b


div {
  style extends c
}
    "#,
  )],
  r#"
  :root {
    --a-font-family-80f4925f-2: Helvetica;
    --b-color-80f4925f-5: red; --c-font-family-80f4925f-2:
    var(--a-font-family-80f4925f-2);
    --c-color-80f4925f-5: var(--b-color-80f4925f-5);
  }

  ._80f4925f-12 {
    font-family: var(--a-font-family-80f4925f-2);
    color: var(--b-color-80f4925f-5);
  }
  "#
}

add_case! {
    can_define_styles_on_inserted_elements,
    [
("/entry.pc", r#"
	public component A {
		render div {
			slot children
		}
	}

	A {
		div {
			style {
				background: blue
			}
			text "Hello"
		}
	}
"#)
    ],
    "._80f4925f-9 { background: blue; }"
}

add_case! {
  resolves_url_assets,
  [
      ("/entry.pc", r#"
        div {
          style {
            background: url("/test.svg")
          }
        }
      "#),
      ("/test.svg", "something"),
  ],
  r#"._80f4925f-5 { background: url("data:image/svg+xml;base64,c29tZXRoaW5n"); }"#
}

add_case! {
  can_include_style_from_another_file_that_also_extends,
  [
      ("/entry.pc", r#"
        import "/test.pc" as test
        div {
          style extends test.icon {
            mask-url: abba
          }
        }
      "#),
      ("/test.pc", r#"
        style mask {
          mask-size: 100%
        }
        public style icon extends mask {
          --size: 20px
          width: var(--size)
          height: var(--size)
        }
      "#),
  ],
  r#"._80f4925f-6 {
    mask-size: var(--mask-mask-size-6bcf0994-2);
    --size:
    var(--icon---size-6bcf0994-6);
    width: var(--icon-width-6bcf0994-9);
    height: var(--icon-height-6bcf0994-12);
    mask-url: abba;
  }"#
}

add_case! {
  can_define_styles_within_inserts,
  [
      ("/entry.pc", r#"
        div {
          insert test {
            div {
              style {
                color: red
              }
            }
          }
        }
      "#)
  ],
  r#"._80f4925f-4 { color: red; }"#
}

add_case! {
  can_define_styles_within_an_element_slot,
  [
      ("/entry.pc", r#"
        div {
          slot test {
            div blarg {
              style {
                color: blue
              }
            }
          }
        }
      "#)
  ],
  r#"._blarg-80f4925f-4 { color: blue; }"#
}

add_case! {
  can_define_styles_within_text_in_a_slot,
  [
      ("/entry.pc", r#"
        div {
          slot test {
            text blarg "blahh" {
              style {
                color: blue
              }
            }
          }
        }
      "#)
  ],
  r#"._blarg-80f4925f-4 { color: blue; }"#
}

add_case! {
  can_evaluate_a_slot_within_an_insert,
  [
      ("/entry.pc", r#"
        div {
          insert a {
            slot b {
              text "c" {
                style {
                  color: orange
                }
              }
            }
          }
        }
      "#)
  ],
  r#"._80f4925f-4 { color: orange; }"#
}

add_case! {
  can_evaluate_a_render_slot,
  [
      ("/entry.pc", r#"
       component A {
        render slot children {
          div {
            style {
              color: purple
            }
          }
        }
       }
      "#)
  ],
  r#"._A-80f4925f-4 { color: purple; }"#
}

add_case! {
  can_override_a_simple_style,
  [
      ("/entry.pc", r#"
       component A {
         render div something {
          style {
            color: blue
          }
         }
       }

       A {
        override something {
          style {
            color: orange
          }
        }
       }
      "#)
  ],
  r#"._A-something-80f4925f-4 { color: blue; } ._80f4925f-11._A-something-80f4925f-4 { color: orange; }"#
}

add_case! {
  properly_sorts_style_declaration,
  [
      ("/entry.pc", r#"

      A {
       override something {
         style {
           color: orange
         }
       }
      }

       component A {
         render div something {
          style {
            color: blue
          }
         }
       }
      "#)
  ],
  r#"._A-something-80f4925f-9 { color: blue; } ._80f4925f-5._A-something-80f4925f-9 { color: orange; }"#
}

add_case! {
  sorts_declarations_even_within_components,
  [
      ("/entry.pc", r#"

      component B {
        render A {
          override something {
            style {
              color: orange
            }
          }
        }
      }

       component A {
         render div something {
          style {
            color: blue
          }
         }
       }
      "#)
  ],
  r#"._A-something-80f4925f-11 { color: blue; } ._B-80f4925f-5._A-something-80f4925f-11 { color: orange; }"#
}

add_case! {
  can_override_a_nested_instance,
  [
      ("/entry.pc", r#"

       component A {
         render div acdc {
           style {
              color: blue
           }
         }
       }
       component B {
         render A a1
       }

       B {
        override a1.acdc {
          style {
            color: orange
          }
        }
       }
      "#)
  ],
  r#"
  ._A-acdc-80f4925f-4 { color: blue; }
  ._80f4925f-14._B-a1-80f4925f-7._A-acdc-80f4925f-4 { color: orange; }
  "#
}

add_case! {
  can_create_a_style_override_within_a_variant,
  [
      ("/entry.pc", r#"

       component A {
         render div root {
           style {
              color: blue
           }
         }
       }
       component B {
         variant test trigger {
            "@supports mobile"
         }

         render A inst {
           override root {
             style variant test {
               color: purple
             }
           }
         }
       }

      "#)
  ],
  r#"
    ._A-root-80f4925f-4 {
      color: blue;
    }

    ._B-inst-80f4925f-15._A-root-80f4925f-4._variant-80f4925f-9 {
      color: purple;
    }

    @supports mobile {
      ._B-inst-80f4925f-15._A-root-80f4925f-4 {
        color: purple;
      }
    }
  "#
}

add_case! {
  can_create_a_style_override_for_nested_element,
  [
      ("/entry.pc", r#"

       component A {
         render div {
            div hello {
              style {
                color: orange
              }
            }
         }
       }
       component B {
         render A {
           override hello {
             style {
               color: purple
             }
           }
         }
       }

      "#)
  ],
  r#"
  ._A-hello-80f4925f-4 { color: orange; } ._B-80f4925f-12 ._A-hello-80f4925f-4 { color: purple; }
  "#
}

add_case! {
  can_enable_trigger_for_instance,
  [
      ("/entry.pc", r#"

      component A {
        variant isMobile
        render div aElement {
           style variant isMobile {
             color: blue
           }
        }
      }

      component B {
        render A aInstance {
          override {
            variant isMobile trigger { true }
          }
        }
      }

      "#)
  ],
  r#"
  ._A-aElement-80f4925f-6._variant-80f4925f-1 { color: blue; }
  ._B-aInstance-80f4925f-13._A-aElement-80f4925f-6 { color: blue; }
  "#
}

add_case! {
  can_assign_an_instance_variant_to_more_triggers,
  [
      ("/entry.pc", r#"

      component A {
        variant isMobile
        render div aaa {
           style variant isMobile {
             color: blue
           }
        }
      }

      component B {
        render A {
          override {
            variant isMobile trigger {
              "@media screen and (max-width: 1024px)"
            }
          }
        }
      }

      "#)
  ],
  r#"
  ._A-aaa-80f4925f-6._variant-80f4925f-1 { color: blue; } @media screen and (max-width: 1024px) { ._B-80f4925f-13._A-aaa-80f4925f-6 { color: blue; } }
  "#
}

add_case! {
  can_override_variant_combo_trigger,
  [
      ("/entry.pc", r#"

      component A {
        variant a1 trigger {
          ":nth-child(2n)"
        }
        variant b1 trigger {
          "@media screen and (max-width: 200px)"
        }
        render div {
           style variant a1 + b1 {
             color: blue
           }
        }
      }

      component B {
        render A {
          override {
            variant a1 trigger {
              true
            }
          }
        }
      }

      "#)
  ],
  r#"
  ._A-80f4925f-12._variant-80f4925f-3._variant-80f4925f-6 { color: blue; }
  @media screen and (max-width: 200px) { ._A-80f4925f-12:nth-child(2n) { color: blue; } }
  @media screen and (max-width: 200px) { ._B-80f4925f-19._A-80f4925f-12 { color: blue; } }

  "#
}

add_case! {
  can_override_variant_with_variant_toggle,
  [
    ("/entry.pc", r#"
      component D {
        variant isMobile
        render div {
          style variant isMobile {
            color: blue
          }
        }
      }

      component C {
        variant isMobile2 trigger {
          ":nth-child(2n)"
        }
        render D {
          override {
            variant isMobile trigger { isMobile2 }
          }
        }
      }
    "#)
  ],
  r#"
  ._D-80f4925f-6._variant-80f4925f-1 { color: blue; }
  ._C-80f4925f-16._D-80f4925f-6._variant-80f4925f-11 { color: blue; }
  ._C-80f4925f-16._D-80f4925f-6:nth-child(2n) { color: blue; }
  "#
}

// add_case! {
//   nested_instances_with_overrides_are_captured_when_trigger_is_overridden,
//   [
//     ("/entry.pc", r#"
//     component D {
//       variant test trigger {
//         ":nth-child(2n)"
//       }
//       render div {
//         style variant test {
//           color: blue
//         }
//       }
//     }
//     component C {
//       variant test trigger {
//         ".something"
//       }
//       render D {
//         override {
//           variant test trigger { test }
//         }
//       }
//     }
//     "#)
//   ],
//   r#"
//   "#
// }

add_case! {
  can_override_a_nested_variant,
  [
      ("/entry.pc", r#"

      component D {
        variant isMobile trigger {
          "@media screen and (max-width: 10px)"
        }
        render div {
          style variant isMobile {
            color: blue
          }
          text something "blahh" {
            style variant isMobile {
              font-size: 32px
            }
          }
        }
      }
      component C {
        render D d
      }

      component A {
        render div {
          C c
        }
      }

      component B {
        render A blarg {
          override c.d {
            variant isMobile trigger {
              true
            }
          }
        }
      }

      "#)
  ],
  r#"
  ._D-80f4925f-13._variant-80f4925f-3 { color: blue; }
  @media screen and (max-width: 10px) { ._D-80f4925f-13 { color: blue; } }

  ._D-80f4925f-13._variant-80f4925f-3 ._D-something-80f4925f-12 { font-size: 32px; }
  @media screen and (max-width: 10px) { ._D-80f4925f-13 ._D-something-80f4925f-12 { font-size: 32px; } }

  ._B-blarg-80f4925f-27 ._A-c-80f4925f-19._C-d-80f4925f-16._D-80f4925f-13 { color: blue; }
  ._B-blarg-80f4925f-27 ._A-c-80f4925f-19._C-d-80f4925f-16 ._D-something-80f4925f-12 { font-size: 32px; }
  "#
}

add_case! {
  can_override_with_extended_style,
  [
    ("/entry.pc", r#"
      import "/module.pc" as module

      style something {
        background: orange
      }

      public component A {
        render div {
          module.B {
            override root {
              style extends something
            }
          }
        }
      }
    "#),
    ("/module.pc", r#"
      style something {
        color: blue
      }
      public component B {
        render div {
          div root {
            style extends something
          }
        }
      }
    "#)
  ],
  r#"
  :root { --something-background-80f4925f-3: orange; }
  ._A-80f4925f-8 ._B-root-139cec8e-6 { background: var(--something-background-80f4925f-3); }
  "#
}

add_case! {
  nested_override_styles_are_properly_sorted,
  [
    ("/entry.pc", r#"
      component Tree {
        render span root {
          style {
            --depth: 1
          }
          slot children
        }
      }

      component Folder {
        render Tree container {
          override root {
            style {
              --depth: var(--depth)
            }
          }
          slot children
        }
      }

      component BBA {
      render span {
        Folder abba {
          override container.root {
            style {
              --depth: 2
            }
          }
        }
      }
    "#)
  ],
  r#"

  ._Tree-root-80f4925f-5 { --depth: 1; }
  ._Folder-container-80f4925f-14._Tree-root-80f4925f-5 { --depth: var(--depth); }
  ._BBA-abba-80f4925f-21._Folder-container-80f4925f-14._Tree-root-80f4925f-5 { --depth: 2; }
  "#
}

add_case! {
  can_define_var_within_calc,
  [
    ("/entry.pc", r#"
      component Something {
        render span root {
          style {
            left: calc(10* var(--x) /8)
          }
        }
      }
    "#)
  ],
  r#"
  ._Something-root-80f4925f-10 { left: calc(10 * var(--x) / 8); }
  "#
}

add_case! {
  can_override_a_nested_instance_with_a_variant,
  [
    ("/entry.pc", r#"
      component A {
        render span a_root {
          style {
            display: none
          }
          span a_text {

          }
        }
      }

      component B {
        variant test trigger {
          ".something"
        }
        render div b_root {
          A {
            override a_root {
              style variant test {
                display: block
              }
            }
            override a_root.a_text {
              style variant test {
                display: block
              }
            }
          }

          span text {
            style variant test {
              color: blue
            }
          }
        }
      }
    "#)
  ],
  r#"
  ._A-a_root-80f4925f-5 { display: none; }
  ._B-b_root-80f4925f-27._variant-80f4925f-10 ._B-text-80f4925f-26 { color: blue; }
  ._B-b_root-80f4925f-27.something ._B-text-80f4925f-26 { color: blue; }
  ._B-b_root-80f4925f-27._variant-80f4925f-10 ._B-80f4925f-21._A-a_root-80f4925f-5 { display: block; }
  ._B-b_root-80f4925f-27.something ._B-80f4925f-21._A-a_root-80f4925f-5 { display: block; }
  ._B-b_root-80f4925f-27._variant-80f4925f-10 ._B-80f4925f-21 ._A-a_text-80f4925f-4 { display: block; }
  ._B-b_root-80f4925f-27.something ._B-80f4925f-21 ._A-a_text-80f4925f-4 { display: block; }
  "#
}

add_case! {
  can_override_a_nested_instance_with_a_variant_using_a_media_trigger,
  [
    ("/entry.pc", r#"
      component A {
        render span a_root {
          style {
            display: none
          }
          span a_text {

          }
        }
      }

      component B {
        variant test trigger {
          "@media (min-width: 100px)"
        }
        render div b_root {
          A {
            override a_root {
              style variant test {
                display: block
              }
            }
          }
        }
      }
    "#)
  ],
  r#"
   ._A-a_root-80f4925f-5 { display: none; }
   ._B-b_root-80f4925f-17._variant-80f4925f-10 ._B-80f4925f-16._A-a_root-80f4925f-5 { display: block; }
   @media (min-width: 100px) {
    ._B-b_root-80f4925f-17 ._B-80f4925f-16._A-a_root-80f4925f-5 { display: block; }
   }
  "#
}

add_case! {
  styles_with_variants_that_dont_exist_are_no_op,
  [
    ("/entry.pc", r#"
      component A {
        variant a
        render span root {
          style {
            display: none
          }
          style variant a + b {
            color: blue
          }
        }
      }
    "#)
  ],
  r#"
  ._A-root-80f4925f-10 { display: none; }
  "#
}

add_case! {
  can_toggle_root_instance_variant_style,
  [
    ("/entry.pc", r#"

      style test {
        color: white
      }
      component A {
        variant a
        render div root {
          style variant a {
            color: blue
          }
          style extends test {
            color: white
          }
        }
      }

      A instance {
        override {
          variant a trigger {
            true
          }
        }
      }
    "#)
  ],
  r#"
  :root { --test-color-80f4925f-2: white; }
  ._A-root-80f4925f-13._variant-80f4925f-4 { color: blue; }
  ._A-root-80f4925f-13 { color: var(--test-color-80f4925f-2); color: white; }
  ._instance-80f4925f-20._A-root-80f4925f-13 { color: blue; }
  "#
}

add_case! {
  can_bind_instance_variant_to_combo_variant,
  [
    ("/entry.pc", r#"

      style test {
        color: white
      }

      component A {
        variant a
        render div root {
          style variant a {
            color: blue
          }
        }
      }

      component B {
        variant b trigger {
          "@media screen and (max-width: 100px)"
        }
        variant c trigger {
          "@supports mobile"
        }
        variant e trigger {
          "@supports mobile"
          "@media screen and (max-width: 100px)"
        }
        render A {
          override {
            variant a trigger {
              b + c
              ".test"
            }
          }
        }
      }
    "#)
  ],
  r#"
  :root { --test-color-80f4925f-2: white; }

  ._A-root-80f4925f-9._variant-80f4925f-4 { color: blue; }
  ._B-80f4925f-30._A-root-80f4925f-9._variant-80f4925f-14._variant-80f4925f-17 { color: blue; }

  @media screen and (max-width: 100px) {
    ._B-80f4925f-30._A-root-80f4925f-9._variant-80f4925f-17 { color: blue; }
  }

  @supports mobile {
    ._B-80f4925f-30._A-root-80f4925f-9._variant-80f4925f-14 {
      color: blue;
    }
  }

  @supports mobile {
    @media screen and (max-width: 100px) {
      ._B-80f4925f-30._A-root-80f4925f-9 {
        color: blue;
      }
    }
  }

  ._B-80f4925f-30._A-root-80f4925f-9.test { color: blue; }
  "#
}

add_case! {
  instance_variant_can_be_bound_to_component_variant,
  [
    ("/entry.pc", r#"

      style test {
        color: white
      }

      component A {
        variant a
        render div root {
          style variant a {
            color: blue
          }
        }
      }

      component B {
        variant b
        render div {
          A element {
            override {
              variant a trigger {
                b
              }
            }
          }
          div {
            style variant b {
              color: red
            }
          }
        }
      }
    "#)
  ],
  r#"
  :root { --test-color-80f4925f-2: white; }
  ._A-root-80f4925f-9._variant-80f4925f-4 { color: blue; }
  ._B-80f4925f-23._variant-80f4925f-12 ._B-element-80f4925f-17._A-root-80f4925f-9 { color: blue; }
  ._B-80f4925f-23._variant-80f4925f-12 ._B-80f4925f-22 { color: red; }
  "#
}

/*

/**
 * @bounds(x: 434, y: 640, width: 349, height: 181)
*/

public component test {
    variant test
    render div test {
        style variant test {
            background: black
        }
        style {
            position: relative
            background: white
        }
        imp.RadioInput {
            override {
                variant on trigger {
                    test
                }
            }
        }
    }
}

 */

add_case! {
  can_override_a_variant_of_a_radio_input,
  [
    ("/entry.pc", r#"

component RadioInput {
    variant on trigger {
        ".on"
    }
    render div container(onClick: onClick, class: class) {
        style variant on {
            background: var(theme.blue00)
        }
        div dot {
            style variant on {
                left: 100%
            }
            style {
                left: 0px
            }
        }
    }
}



    component test {
      variant test22
      render div test {
          style variant test22 {
              background: black
          }
          RadioInput radio {
              override {
                  variant on trigger {
                      test22
                  }
              }
          }
      }
  }
    "#)
  ],
  r#"
  ._RadioInput-container-80f4925f-21._variant-80f4925f-3 { background: var(theme.blue00); }
  ._RadioInput-container-80f4925f-21.on { background: var(theme.blue00); }
  ._RadioInput-container-80f4925f-21._variant-80f4925f-3 ._RadioInput-dot-80f4925f-20 { left: 100%; }
  ._RadioInput-container-80f4925f-21.on ._RadioInput-dot-80f4925f-20 { left: 100%; }
  ._RadioInput-dot-80f4925f-20 { left: 0px; }
  ._test-test-80f4925f-34._variant-80f4925f-24 { background: black; }
  ._test-test-80f4925f-34._variant-80f4925f-24 ._test-radio-80f4925f-33._RadioInput-container-80f4925f-21 { background: var(theme.blue00); }
  ._test-test-80f4925f-34._variant-80f4925f-24 ._test-radio-80f4925f-33 ._RadioInput-dot-80f4925f-20 { left: 100%; }
  "#
}

add_case! {
  instance_style_overrides_are_defined_only_on_instance,
  [
    ("/entry.pc", r#"


    component A {
      render div {
        style {
          color: orange
        }
        span {
          style {
            color: blue
          }
        }
      }
    }

    A {
      style {
        color: purple
      }
    }
    "#)
  ],
  r#"
  ._A-80f4925f-8 { color: orange; }
  ._A-80f4925f-7 { color: blue; }
  ._A-80f4925f-8._80f4925f-14 { color: purple; }
  "#
}

add_case! {
  evaluates_css_in_repeat,
  [
    ("/entry.pc", r#"


    component A {
      render div {
        repeat items {
          span {
            style {
                color: red
            }
          }
        }
      }
    }
    "#)
  ],
  r#"
  ._A-80f4925f-4 { color: red; }
  "#
}

add_case! {
  evaluates_css_in_switch,
  [
    ("/entry.pc", r#"


    component A {
      render div {
        switch a {
          case "b" {
            span {
              style {
                color: blue
              }
            }
          }
          case "c" {
            span {
              style {
                color: purple
              }
            }
          }
        }
      }
    }
    "#)
  ],
  r#"
  ._A-80f4925f-4 { color: blue; } ._A-80f4925f-9 { color: purple; }
  "#
}

add_case! {
  evlauates_css_in_condition,
  [
    ("/entry.pc", r#"


    component A {
      render div {
        if a {
            span {
                style {
                    color: blue
                }
            }
        }
      }
    }
    "#)
  ],
  r#"
  ._A-80f4925f-4 { color: blue; }
  "#
}

add_case! {
  scope_class_is_passed_down,
  [
  ("/entry.pc", r#"
  component A {
      render div root(class: class)
  }
  component B {
      render A root(class: class)
  }
  component C {
      render div {
          B {
              style {
                  color: orange
              }
          }
      }
  }
"#)
  ],
  r#"
  ._B-root-80f4925f-8._C-80f4925f-14 { color: orange; } 
"#
}


