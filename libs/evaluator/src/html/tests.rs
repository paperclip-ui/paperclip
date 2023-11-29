use super::evaluator::{evaluate, Options};
use super::serializer::serialize;
use crate::core::io::PCFileResolver;
use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::core::parser_context::Options as ParserOptions;
use paperclip_proto::ast::graph;
use paperclip_proto::virt;
use paperclip_proto_ext::graph::load::LoadableGraph;
use paperclip_proto_ext::graph::test_utils;
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
    if let Err(_err) = block_on(graph.load(
        "/entry.pc",
        &mock_fs,
        ParserOptions::new(vec![
            "repeat".to_string(),
            "switch".to_string(),
            "condition".to_string(),
        ]),
    )) {
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
    "<div class=\"_C-80f4925f-1\"> </div>
    <div class=\"_C-80f4925f-1 _B-80f4925f-4\"> </div>
    <div class=\"_C-80f4925f-1 _A-80f4925f-7 _B-80f4925f-4\"> </div>"
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
	<span class="_C-139cec8e-7 _B-139cec8e-2">
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
		A inst(class: "b c d e")
	"#)
    ],
    r#"
	<div class="_A-80f4925f-3 undefined"> </div>
	<div class="_A-80f4925f-3 _inst-80f4925f-8 b c d e"> </div>
"#
}
add_case! {
    img_urls_are_left_as_is,
    [
    ("/entry.pc", r#"
        img (src: "http://google.com")
        img (src: "https://google.com")
	"#)
    ],
    r#"
	<img src="http://google.com"> <img src="https://google.com">
"#
}

add_case! {
    inst_classes_are_attached_only_at_root,
    [
    ("/entry.pc", r#"
        component B {
            render span {

            }
        }
        component A {
            render div root {
                B
            }
        }

        A inst
	"#)
    ],
    r#"
    <span class="_B-80f4925f-1"> </span>

    <div class="_A-root-80f4925f-5">
        <span class="_B-80f4925f-1 _A-80f4925f-4"> </span>
    </div>

    <div class="_A-root-80f4925f-5 _inst-80f4925f-8">
        <span class="_B-80f4925f-1 _A-80f4925f-4">
        </span>
    </div>
"#
}

// NECESSARY for custom elements
add_case! {
    tag_names_can_contain_hyphens,
    [
    ("/entry.pc", r#"
        some-custom-el(a: "b") {
            text "somethin"
        }
	"#)
    ],
    r#"
    <some-custom-el a="b"> somethin </some-custom-el>
"#
}

// business rule decision for inserts. If `insert slot {}` then default to original
// children. Reason for this is because inserts are added in the editor by default so that
// they're accessible.
add_case! {
    empty_inserts_are_ignored,
    [
    ("/entry.pc", r#"
        component A {
            render div {
                slot abba {
                    text "blah"
                }
            }
        }
        A {
            insert abba {

            }
        }
	"#)
    ],
    r#"
	<div class="_A-80f4925f-3">
    blah
</div>
<div class="_A-80f4925f-3 _80f4925f-7">
blah
</div>
"#
}

add_case! {
    can_evaluate_a_switch_case,
    [
    ("/entry.pc", r#"
        component A {
            render switch show {
                case "a" {
                    text "a"
                    span {
                        text "a2"
                    }
                }
                default {
                        text "b"
                    }
            }
        }

        A(show: "a")
	"#)
    ],
    r#"
    b
    a
    <span>
        a2
    </span>
"#
}

add_case! {
    can_evaluate_a_condition,
    [
    ("/entry.pc", r#"
        component A {
            render div {
                if show {
                    text "blah"
                }
                text "something else"
            }
        }

        A(show: true)
        A
	"#)
    ],
    r#"
    <div class="_A-80f4925f-4">
        something else
    </div>
    <div class="_A-80f4925f-4 _80f4925f-9">
        blah
        something else
    </div>
    <div class="_A-80f4925f-4 _80f4925f-10">
        something else
    </div>
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
            B bbbbb {
                style {
                    color: blue
                }
            }
            div {
                style {
                    color: red
                }
            }
        }
    }
	"#)
    ],
    r#"
    <div class="_A-root-80f4925f-3 undefined">
    </div>
    <div class="_A-root-80f4925f-3 _B-root-80f4925f-8 undefined">
    </div>
    <div class="_C-80f4925f-19">
        <div class="_A-root-80f4925f-3 _C-bbbbb-80f4925f-14 _B-root-80f4925f-8 undefined">
        </div>
        <div class="_C-80f4925f-18">
        </div>
    </div>
"#
}

add_case! {
    can_use_preview_metadata_to_render_frame,
    [
    ("/entry.pc", r#"

    /**
     * @preview(showTest: true, nested: (showSomethingElse: true))
     */
    component A {
        render div root {
            if showTest {
                text "blarg"
            }
            B nested
        }
    }
    component B {
        render div {
            if showSomethingElse {
                text "something else"
            }
        }
    }
	"#)
    ],
    r#"
    <div class="_A-root-80f4925f-15"> 
        blarg 
        <div class="_B-80f4925f-20 _A-nested-80f4925f-14"> something else </div> 
    </div> 
    <div class="_B-80f4925f-20"> </div>
"#
}

add_case! {
    previews_can_define_a_collection_of_values,
    [
    ("/entry.pc", r#"

    /**
     * @preview(items: [(value: 1), (value: "2"), (value: true)])
     */
    component A {
        render div root {
            repeat items {
                span {
                    slot value
                }
            }
        }
    }
	"#)
    ],
    r#"
    <div class="_A-root-80f4925f-20">
    <span>
        1
    </span>
    <span>
        2
    </span>
    <span>
        true
    </span>
</div>
"#
}


add_case! {
    can_render_a_nested_list,
    [
    ("/entry.pc", r#"

    /**
     * @preview(a: [(b: [(c: 1), (c: 2), (c: 3)])])
     */
    component A {
        render div root {
            repeat a {
                text "a"
                repeat b {
                    text "b"
                    slot c
                }
            }
        }
    }
	"#)
    ],
    r#"
    <div class="_A-root-80f4925f-25">
    a
    b
    1
    b
    2
    b
    3
</div>
"#
}



add_case! {
    can_render_conditionals_in_repeated_lists,
    [
    ("/entry.pc", r#"

    /**
     * @preview(a: [(show: true), (show: false)])
     */
    component A {
        render div root {
            repeat a {
                text "a"
                if show {
                    text "b"
                }
            }
        }
    }
	"#)
    ],
    r#"
    <div class="_A-root-80f4925f-18">
    a
    b
    a
</div>
"#
}




add_case! {
    instances_use_preview_data,
    [
    ("/entry.pc", r#"


    /**
     * @preview(show: true)
     */
    component A {
        render div {
            if show {
                text "aye!"
            }
            if showOther {
                text "other!"
            }
        }
    }
    
    component B {
        render div {
            A aInst
        }
    }

    /**
     * @preview(bInst:(aInst:(show: false, showOther: true)))
     */

    component C {
        render div {
            B bInst
        }
    }
	"#)
    ],
    r#"
    <div class="_A-80f4925f-12">
    aye!
</div>
<div class="_B-80f4925f-16">
    <div class="_A-80f4925f-12 _B-aInst-80f4925f-15">
        aye!
    </div>
</div>
<div class="_C-80f4925f-33">
    <div class="_B-80f4925f-16 _C-bInst-80f4925f-32">
        <div class="_A-80f4925f-12 _B-aInst-80f4925f-15">
            other!
        </div>
    </div>
</div>
"#
}
