use super::ast;
use super::parser::parse;
use super::serializer::serialize;
use crate::core::errors as err;

use crate::base::ast::{Range, U16Position};
use pretty_assertions;
use textwrap::dedent;

#[test]
fn can_parse_various_contents() {
    let tests: Vec<(&str, Result<(), err::ParserError>)> = vec![
        // Can parse an empty document
        ("", Ok(())),
        // Can parse a component
        ("component ABC {\n}", Ok(())),
        (
            "component",
            Err(err::ParserError::new(
                "Unexpected token".to_string(),
                Range::new(U16Position::new(9, 1, 10), U16Position::new(9, 1, 10)),
                err::ErrorKind::UnexpectedToken,
            )),
        ),
        ("import \"abcde\" as imp1\n", Ok(())),
        ("style {\n}", Ok(())),
        (
            r#"
            component A {
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render text "hello world"
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render text "hello world" {
                    style {
                        color: red
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div {
                    style {
                        color: red
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render ns.div
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div {
                    style {
                        color: red
                    }
                    text "hello world"
                    span
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            import "" as d
            component A {
                render div {
                    style {
                        color: red
                    }
                    text "hello world"
                    span
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            import "" as d
            import "" as b
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
            }

            component B {
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div {
                    override {
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div {
                    override {
                        style {
                            color: blue
                        }
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div(a: "blah", b: "barb")
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component B {
                render slot test {
                    text "default child"
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render B {
                    insert test {
                        text "overridden child"
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            trigger mobile {
                "media screen and (max-width: 320px)"
            }
        "#,
            Ok(()),
        ),
        (
            r#"

            component A {
                variant a trigger {
                    everyOther
                    true
                }
                render div {
                    style {
                        color: blue
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                variant a
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                variant a trigger {
                    some.ref
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                script(src: "abba")
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div {
                    override a.b.c {
                        variant a
                        style {
                            color: blue
                        }
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            component A {
                render div refName
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            /*** @bounds(width: 100, height: 100, x: -100.5, y: -0.5) */
            component A {
                render div
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            /** define a mixin */
            style {
                background-color: blue
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            style a {
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            style extends a, b.d.e {
                display: inline-block
                width: blarg
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            style variant test extends a, b.d.e {
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            style ab variant test extends a, b.d.e {
                color: blue
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            public style {
            }
            public component A {
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            public component A {
                variant ab
                variant abc
                render div test {
                    style variant ab + abc {
                    }
                }
            }
        "#,
            Ok(()),
        ),
        (
            r#"
            style {
                height: 100vh
                z-index: 99999
            }
            "#,
            Ok(()),
        ),
        (
            r#"
            style {
                background: var(imp0.grey1)
            }
            "#,
            Ok(()),
        ),
        (
            r#"
                div preview {
                    style {
                        display: block
                    }
                }
            "#,
            Ok(()),
        ),
        (
            r#"
                public component Test {
                    script(src: "./controller.tsx")
                }
            "#,
            Ok(()),
        ),
        (
            r#"
            public component Picker {
                render div {
                    a.b
                    a.b
                }
            }
            "#,
            Ok(()),
        ),
        (
            r#"
            public component Picker {
                render div {
                    a.b
                    a.b
                }
            }
            "#,
            Ok(()),
        ),
        (
            r#"
                text ab
            "#,
            Ok(()),
        ),
        (
            r#"
                public token blackTransparent rgba(1, 0, 0, 0.16)
            "#,
            Ok(()),
        ),
        (
            r#"
                div(aria-label: "abba", style: "color: red;")
            "#,
            Ok(()),
        ),
    ];

    for (source, result) in tests {
        let parse_result = parse(source, &"".to_string());
        println!("Try parsing {}", source);

        if let Ok(ast) = parse_result {
            let output = serialize(&ast);
            assert_eq!(dedent(source).trim(), dedent(output.as_str()).trim());
        } else if let Err(err) = parse_result {
            pretty_assertions::assert_eq!(Err(err), result);
        }
    }
}
