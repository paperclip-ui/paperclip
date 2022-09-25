use super::evaluator::{evaluate, Options};
use super::serializer::serialize;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;

// TODO: ensure no infinite loop
// TODO: check imported instances
// TODO: slots & inserts
// TODO: evaluate slot in insert

struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, to: &str) -> Option<String> {
        Some(to.to_string())
    }
}

macro_rules! add_case {
    ($name: ident, $input: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($input));
            let mut graph = graph::Graph::new();
            if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
                panic!("Unable to load");
            }
            let resolver = MockResolver {};
            let doc = block_on(evaluate(
                "/entry.pc",
                &graph,
                &resolver,
                Options {
                    include_components: true,
                },
            ))
            .unwrap();
            println!("Try evaluating");
            println!("{}", serialize(&doc).trim());
            assert_eq!(
                strip_extra_ws(serialize(&doc).as_str()),
                strip_extra_ws($output)
            );
        }
    };
}

add_case! {
    can_evaluate_a_div,
    [("/entry.pc", "div")],
    r#"
			<div>
			</div>
		"#
}

add_case! {
    can_evaluate_text,
    [("/entry.pc", "text \"hello\"")],
    r#"
			hello
		"#
}

add_case! {
    can_evaluate_attributes,
    [("/entry.pc", "div (a: \"b\", c: \"d\")")],
    r#"
			<div a="b" c="d">
			</div>
		"#
}

add_case! {
    can_evaluate_a_component,
    [("/entry.pc", r#"
			component A {
				render div {
					text "Hello world"
				}
			}
		"#)],
    "<div> Hello world </div>"
}

add_case! {
    properly_evaluates_void_tags,
    [("/entry.pc", r#"
			hr
			br
		"#)],
    "<hr> <br>"
}

add_case! {
    can_evaluate_inserts_and_slots,
    [("/entry.pc", r#"
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
	"#)],
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
	"#
}

add_case! {
    can_evaluate_a_nested_insert,
    [("/entry.pc",r#"
		component A {
			render slot a1 {
				text "a"
			}
		}

		component B {
			render A {
				insert a1 {
					slot a2 {
						text "b"
					}
				}
			}
		}

		B {
			insert a2 {
				text "c"
			}
		}
	"#)],
    "a b c"
}

add_case! {
    can_evaluate_an_instance_from_another_file,
    [
        ("/comp.pc", r#"
			public component Test {
				render span {
					slot children
				}
			}
		"#),
        ("/entry.pc", r#"
			import "/comp.pc" as comp

			comp.Test {
				text "Hello world"
			}
		"#),

    ],
    "<span> Hello world </span>"
}

add_case! {
    combines_explicit_classnames_with_ns,
    [
        ("/entry.pc", r#"
			div (class: "p-10 bg-red") {
				style {
					color: blue
				}
				text "Hello"
			}
		"#)
    ],
    "<div class=\"_80f4925f-7 p-10 bg-red\"> Hello </div>"
}

add_case! {
    elements_with_ids_have_scope_classes,
    [
                    ("/entry.pc", r#"
	div ab
"#)
    ],
    "<div class=\"_ab-80f4925f-1\"> </div>"
}

add_case! {
    wraps_text_nodes_in_span_if_styles_exist,
    [
                    ("/entry.pc", r#"
	text "abba" {
		style {
			color: blue
		}
	}
"#)
    ],
    "<span class=\"_80f4925f-4\"> abba </span>"
}



add_case! {
	adds_component_namespace_to_classes,
	[
("/entry.pc", r#"
public component Ab {
	render div {
		style {
			color: red
		}
		text "abba"
	}
}
"#)
	],
	"<div class=\"_Ab-80f4925f-5\"> abba </div>"
}
