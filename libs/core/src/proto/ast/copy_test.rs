use crate::config::{Config, ConfigContext};

use super::super::graph::{load::LoadableGraph, test_utils};
use super::copy::copy_expression;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext as graph;
use std::collections::HashMap;

macro_rules! case {
    ($name: ident, $mock_files: expr, $expr_id: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let config_context = ConfigContext {
                directory: "/".to_string(),
                file_name: "paperclip.config.json".to_string(),
                config: Config::default(),
            };

            let mock_fs = test_utils::MockFS::from_config_context(
                HashMap::from($mock_files),
                &config_context,
            );

            let mut graph = graph::Graph::new();

            let features = vec!["condition".to_string(), "styleOverride".to_string()];

            for (path, _) in $mock_files {
                block_on(graph.load(&path, &mock_fs, Options::new(features.clone())))
                    .expect("Unable to load");
            }
            println!("{:#?}", graph.dependencies);

            let output = copy_expression($expr_id, &graph);
            assert_eq!(strip_extra_ws(&output), strip_extra_ws($expected_output));
        }
    };
}

macro_rules! xcase {
    ($name: ident, $mock_files: expr, $expr_id: expr, $expected_output: expr) => {};
}

case! {
    can_package_a_simple_expr,
    [
        (
            "/entry.pc",
            r#"
                div {
                    style {
                        color: blue
                    }
                }
            "#
        )
    ],
    "80f4925f-4",
    "div { style { color: blue } }"
}

case! {
    copies_metadata,
    [
        (
            "/entry.pc",
            r#"
                /**
                 * @frame(x: 10, y: 10)
                 */
                div {
                    style {
                        color: blue
                    }
                }
            "#
        )
    ],

    "80f4925f-13",
    r#"
    /**
     * @frame(x: 10, y: 10)
     */
    div {
        style {
            color: blue
        }
    }
    "#
}

case! {
    creates_an_instance_of_component_with_import,
    [
        (
            "/entry.pc",
            r#"
                /**
                 * @frame(x: 10, y: 10)
                 */
                component A {
                    render div {

                    }
                }
            "#
        )
    ],

    "80f4925f-12",
    r#"
    import "/entry.pc" as mod
    /**
     * @frame(x: 10, y: 10)
     */
    mod.A
    "#
}

case! {
    imports_are_included,
    [
        (
            "/entry.pc",
            r#"
                /**
                 * @frame(x: 10, y: 10)
                 */
                component A {
                    render div {

                    }
                }
            "#
        )
    ],

    "80f4925f-12",
    r#"
    import "/entry.pc" as mod
    /**
     * @frame(x: 10, y: 10)
     */
    mod.A
    "#
}

case! {
    instance_imports_are_captured,
    [
        (
            "/entry.pc",
            r#"
               import "/module.pc" as module

               module.Test
            "#
        ),
        (
            "/module.pc",
            r#"
                component Test {
                    render div
                }
            "#
        )
    ],

    "80f4925f-2",
    r#"
    import "/module.pc" as module

    module.Test
    "#
}

case! {
    var_refs_are_includes,
    [
        (
            "/entry.pc",
            r#"
               import "/module.pc" as module

               div {
                style {
                    color: var(module.abba)
                }
               }
            "#
        ),
        (
            "/module.pc",
            r#"
                public token abba red
            "#
        )
    ],

    "80f4925f-6",
    r#"
    import "/module.pc" as module
    div {
        style {
            color: var(module.abba)
        }
    }
    "#
}

xcase! {
    import_included_when_copying_instance,
    [
        (
            "/entry.pc",
            r#"
                component A {
                    render div {

                    }
                }

                A
            "#
        )
    ],

    "80f4925f-4",
    r#"
    import "/entry.pc" as mod
    /**
     * @frame(x: 10, y: 10)
     */
    mod.A
    "#
}
