use super::evaluator::{evaluate, Options};
use super::serializer::serialize;
use crate::core::io::PCFileResolver;
use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph;
use paperclip_parser::graph::test_utils;
use paperclip_proto::virt;
use std::collections::HashMap;

// TODO: ensure no infinite loop
// TODO: check imported instances
// TODO: slots & inserts
// TODO: evaluate slot in insert

#[derive(Clone)]
struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, to: &str) -> Result<String> {
        Ok(to.to_string())
    }
}

fn evaluate_doc(sources: HashMap<&str, &str>) -> virt::html::Document {
    let mock_fs = test_utils::MockFS::new(sources);
    let mut graph = graph::Graph::new();
    if let Err(_err) = block_on(graph.load("/entry.pc", &mock_fs)) {
        panic!("Unable to load");
    }
    let resolver = MockResolver {};
    let pc_resolver = PCFileResolver::new(mock_fs.clone(), resolver.clone(), None);
    block_on(evaluate(
        "/entry.pc",
        &graph,
        &pc_resolver,
        Options {
            include_components: true,
        },
    ))
    .unwrap()
}

macro_rules! add_case {
    ($name: ident, $input: expr, $output: expr) => {
        #[test]
        fn $name() {
            let doc = evaluate_doc(HashMap::from($input));
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
    "<div class=\"_A-80f4925f-2\"> Hello world </div>"
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
			<span class="_A-80f4925f-7">
					<h1>
							default title
					</h1>
					<p>
							default child
					</p>
			</span>

			<span class="_A-80f4925f-7 _80f4925f-14">
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
    "<span class=\"_Test-389f3606-2 _80f4925f-3\"> Hello world </span>"
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
    "<div class=\"_A-80f4925f-2\"> </div> <div class=\"_A-80f4925f-2 _80f4925f-10\"> <div class=\"_80f4925f-9\"> Hello </div> </div>"
}

add_case! {
    resolves_img_assets,
    [
            ("/entry.pc", "img(src: '/test.svg')"),
            ("/test.svg", "something"),
    ],
    r#"<img src="data:image/svg+xml;base64,c29tZXRoaW5n">"#
}

add_case! {
    classes_are_added_to_instances_that_are_render_nodes,
    [
                    ("/entry.pc", r#"
			component B {
				render div bba {

				}
			}

			component A {
				render B {
					override bba {
						style {
							color: orange
						}
					}
				}
			}
		"#)
    ],
    "<div class=\"_B-bba-80f4925f-1\"> </div> <div class=\"_B-bba-80f4925f-1 _A-80f4925f-8\"> </div>"
}
add_case! {
    classes_are_added_to_nested_instances_that_are_render_nodes,
    [
                    ("/entry.pc", r#"
					component C {
						render div {
		
						}
					}

					component B {
						render C
					}

			component A {
				render B
			}
		"#)
    ],
    "<div class=\"_C-80f4925f-1\"> </div> <div class=\"_C-80f4925f-1 _B-80f4925f-4\"> </div> <div class=\"_C-80f4925f-1 _A-80f4925f-7 _B-80f4925f-4\"> </div>"
}

add_case! {
    can_override_style_of_instance,
    [
        ("/entry.pc", r#"
		component Header {
			render div root {
				style {
					color: orange
				}
			}
		}
		component Container {
			render div {
				Header {
					override root {
						style {
							color: blue
						}
					}
				}
			}
		}
"#)
    ],
    "<div class=\"_Header-root-80f4925f-4\"> </div> <div class=\"_Container-80f4925f-12\"> <div class=\"_Header-root-80f4925f-4 _Container-80f4925f-11\"> </div> </div>"
}

add_case! {
    can_render_instances_within_different_docs,
    [
            ("/entry.pc", r#"
		import "/module.pc" as mod
		component A {
			render mod.B {

			}
		}
	"#),

            ("/module.pc", r#"
		public component B {
			render div {
				C {
					text "Hello"
				}
			}
		}
		component C {
			render span {
				slot children
			}
		}
	"#)

    ],
    r#"
<div class="_B-139cec8e-3 _A-80f4925f-2">
	<span class="_C-139cec8e-7 _A-80f4925f-2 _B-139cec8e-2">
			Hello
	</span>
</div>
"#
}

add_case! {
    can_bind_an_attribute,
    [
    ("/entry.pc", r#"
		component A {
			render div(data-test: a) {

			}
		}
		A(a: "b")
	"#)
    ],
    r#"
	<div class="_A-80f4925f-3" data-test="undefined">
	</div> 
	<div class="_A-80f4925f-3 _80f4925f-8" data-test="b"> </div>
"#
}

add_case! {
    can_bind_to_class_and_still_maintain_scope,
    [
    ("/entry.pc", r#"
		component A {
			render div(class:class) {

			}
		}
		A(class: "b c d e")
	"#)
    ],
    r#"
	<div class="_A-80f4925f-3 undefined"> </div> 
	<div class="_A-80f4925f-3 _80f4925f-8 b c d e"> </div>
"#
}

#[test]
fn bounds_are_attached_to_root_elements() {
    let doc = evaluate_doc(HashMap::from([(
        "/entry.pc",
        r#"
				/**
				 * @bounds(width: 100, height: 100, x: 100, y: 100)
				 */
				div {
					text "Hello world"
				}
			"#,
    )]));

    let element = doc.children.get(0).expect("Node must exist").get_inner();

    assert_eq!(
        element,
        &virt::html::node::Inner::Element(virt::html::Element {
            id: "80f4925f-15".to_string(),
            tag_name: "div".to_string(),
            source_id: Some("80f4925f-15".to_string()),
            source_instance_ids: vec![],
            attributes: vec![],
            metadata: Some(virt::html::NodeMedata {
                visible: Some(true),
                bounds: Some(virt::html::Bounds {
                    x: 100.0,
                    y: 100.0,
                    width: 100.0,
                    height: 100.0
                })
            }),
            children: vec![virt::html::Node {
                inner: Some(virt::html::node::Inner::TextNode(virt::html::TextNode {
                    id: "inner-80f4925f-14".to_string(),
                    source_id: Some("80f4925f-14".to_string()),
                    source_instance_ids: vec![],
                    value: "Hello world".to_string(),
                    metadata: None
                }))
            }]
        })
    );
}

#[test]
fn bounds_are_attached_to_root_components() {
    let doc = evaluate_doc(HashMap::from([(
        "/entry.pc",
        r#"
				/**
				 * @bounds(width: 100, height: 100, x: 100, y: 100)
				 */
				component A {
					render div
				}
			"#,
    )]));

    let element = doc.children.get(0).expect("Node must exist").get_inner();

    assert_eq!(
        element,
        &virt::html::node::Inner::Element(virt::html::Element {
            id: "80f4925f-14".to_string(),
            tag_name: "div".to_string(),
            source_id: Some("80f4925f-14".to_string()),
            source_instance_ids: vec![],
            attributes: vec![virt::html::Attribute {
                source_id: None,
                name: "class".to_string(),
                value: "_A-80f4925f-14".to_string()
            }],
            metadata: Some(virt::html::NodeMedata {
                visible: Some(true),
                bounds: Some(virt::html::Bounds {
                    x: 100.0,
                    y: 100.0,
                    width: 100.0,
                    height: 100.0
                })
            }),
            children: vec![]
        })
    );
}

#[test]
fn bounds_are_attached_to_root_text_nodes() {
    let doc = evaluate_doc(HashMap::from([(
        "/entry.pc",
        r#"
				/**
				 * @bounds(width: 100, height: 100, x: 100, y: 100)
				 */
				text "abba"
			"#,
    )]));

    let element = doc.children.get(0).expect("Node must exist").get_inner();

    assert_eq!(
        element,
        &virt::html::node::Inner::TextNode(virt::html::TextNode {
            id: "inner-80f4925f-14".to_string(),
            value: "abba".to_string(),
            source_id: Some("80f4925f-14".to_string()),
            source_instance_ids: vec![],
            metadata: Some(virt::html::NodeMedata {
                visible: Some(true),
                bounds: Some(virt::html::Bounds {
                    x: 100.0,
                    y: 100.0,
                    width: 100.0,
                    height: 100.0
                })
            })
        })
    );
}

#[test]
fn bounds_are_attached_to_root_instances() {
    let doc = evaluate_doc(HashMap::from([(
        "/entry.pc",
        r#"

				component A {
					render div
				}
				/**
				 * @bounds(width: 100, height: 100, x: 100, y: 100)
				 */
				A
			"#,
    )]));

    let element = doc.children.get(1).expect("Node must exist").get_inner();

    assert_eq!(
        element,
        &virt::html::node::Inner::Element(virt::html::Element {
            id: "80f4925f-1.80f4925f-17".to_string(),
            tag_name: "div".to_string(),
            source_id: Some("80f4925f-1".to_string()),
            source_instance_ids: vec!["80f4925f-17".to_string()],
            attributes: vec![virt::html::Attribute {
                source_id: None,
                name: "class".to_string(),
                value: "_A-80f4925f-1 _80f4925f-17".to_string()
            }],
            metadata: Some(virt::html::NodeMedata {
                visible: Some(true),
                bounds: Some(virt::html::Bounds {
                    x: 100.0,
                    y: 100.0,
                    width: 100.0,
                    height: 100.0
                })
            }),
            children: vec![]
        })
    );
}
