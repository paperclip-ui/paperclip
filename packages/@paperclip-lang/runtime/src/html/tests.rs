use super::evaluator::evaluate;
use super::serializer::serialize;
use crate::base::utils::strip_extra_ws;
use futures::executor::block_on;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::test_utils;
use std::collections::HashMap;

// TODO: ensure no infinite loop
// TODO: check imported instances
// TODO: slots & inserts
// TODO: evaluate slot in insert

macro_rules! add_case {
    ($name: ident, $input: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from([("/entry.pc", $input)]));
            let mut graph = graph::Graph::new();
            block_on(graph.load("/entry.pc", &mock_fs));
            let doc = block_on(evaluate("/entry.pc", &graph)).unwrap();
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
    "div",
    r#"
			<div>
			</div>
		"#
}

add_case! {
    can_evaluate_text,
    "text \"hello\"",
    r#"
			hello
		"#
}

add_case! {
    can_evaluate_attributes,
    "div (a: \"b\", c: \"d\")",
    r#"
			<div a="b" c="d">
			</div>
		"#
}

add_case! {
    can_evaluate_a_component,
    r#"
			component A {
				render div {
					text "Hello world"
				}
			}
		"#,
    "<div> Hello world </div>"
}

add_case! {
    properly_evaluates_void_tags,
    r#"
			hr
			br
		"#,
    "<hr> <br>"
}

add_case! {
    can_evaluate_inserts_and_slots,
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
	"#
}
