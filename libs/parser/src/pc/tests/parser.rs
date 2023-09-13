use super::super::parser::parse;
use crate::core::{errors as err, parser_context::Options};
use paperclip_ast_serialize::pc::serialize;
use paperclip_common::str_utils::strip_extra_ws;

use crate::base::ast::{Range, U16Position};
use pretty_assertions;

macro_rules! add_case {
    ($name: ident, $source: expr) => {
        #[test]
        fn $name() {
            println!("Try parsing {}", $source);
            let parse_result = parse(
                $source,
                &"".to_string(),
                &Options::new(vec![
                    "script".to_string(),
                    "switch".to_string(),
                    "repeat".to_string(),
                ]),
            );
            if let Ok(ast) = parse_result {
                let output = serialize(&ast);
                assert_eq!(strip_extra_ws($source), strip_extra_ws(output.as_str()));
            } else if let Err(_) = parse_result {
                panic!("assertion failed - error returned");
            }
        }
    };
    ($name: ident, $source: expr, $error: expr) => {
        #[test]
        fn $name() {
            println!("Try parsing {}", $source);
            let parse_result = parse(
                $source,
                &"".to_string(),
                &Options::new(vec![
                    "script".to_string(),
                    "switch".to_string(),
                    "repeat".to_string(),
                ]),
            );
            pretty_assertions::assert_eq!(parse_result, $error)
        }
    };
}

add_case! {
    can_parse_an_empty_doc,
    ""
}

add_case! {
    can_parse_a_component,
    "component ABC {\n}"
}

add_case! {
    throws_an_error_for_incomplete_component,
    "component",
    Err(err::ParserError::new(
        "Unexpected token".to_string(),
        Range::new(U16Position::new(9, 1, 10), U16Position::new(9, 1, 10)),
        err::ErrorKind::UnexpectedToken,
    ))
}

add_case! {
    can_parse_imports,
    "import \"abcde\" as imp1\n"
}

add_case! {
    can_parse_style,
    "style"
}

add_case! {
    can_parse_component_with_render,
    "component A { render div }"
}

add_case! {
    can_parse_text_render,
    r#"
        component A {
            render text "hello world"
        }
    "#
}

add_case! {
    can_parse_text_with_a_style,
    r#"
        component A {
            render text "hello world" {
                style {
                    color: red
                }
            }
        }
    "#
}

add_case! {
    can_parse_a_div_with_a_style,
    r#"
        component A {
            render div {
                style {
                    color: red
                }
            }
        }
    "#
}

add_case! {
    can_parse_an_element_with_a_namespace,
    r#"
        component A {
            render ns.div
        }
    "#
}

add_case! {
    can_parse_an_element_with_various_children,
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
    "#
}

add_case! {
    can_parse_various_expressions_with_import,
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
    "#
}

add_case! {
    can_parse_multiple_implrts,
    r#"
        import "" as d
        import "" as b
    "#
}

add_case! {
    can_parse_multiple_components,
    r#"
        component A {
        }

        component B {
        }
    "#
}

add_case! {
    can_parse_an_override,
    r#"
    component A {
        render div {
            override {
            }
        }
    }
    "#
}

add_case! {
    can_parse_an_override_with_a_style,
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
    "#
}

add_case! {
    can_parse_attributes,
    r#"
    component A {
        render div(a: "blah", b: "barb")
    }
    "#
}

add_case! {
    can_parse_an_instance,
    r#"
    component A {
        render span {
            h1 {
                slot title {
                    text "some title"
                }
            }
            p {
                slot children
            }
        }
    }
    A {
        text "hello world"
        insert another {

        }
    }
    "#
}

add_case! {
    can_parse_a_slot,
    r#"
    component B {
        render slot test {
            text "default child"
        }
    }
    "#
}

add_case! {
    can_parse_an_insert,
    r#"
    component A {
        render B {
            insert test {
                text "overridden child"
            }
        }
    }
    "#
}

add_case! {
    can_parse_a_trigger,
    r#"
    trigger mobile {
        "media screen and (max-width: 320px)"
    }
    "#
}

add_case! {
    can_parse_a_variant,
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
    "#
}

add_case! {
    can_parse_a_variant_without_trigger,
    r#"
    component A {
        variant a
    }
    "#
}

add_case! {
    can_parse_a_variant_trigger_with_ref,
    r#"
    component A {
        variant a trigger {
            some.ref
        }
    }
    "#
}

add_case! {
    can_parse_a_component_script,
    r#"
    component A {
        script(src: "abba")
    }
    "#
}

add_case! {
    can_parse_a_nested_override,
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
    "#
}

add_case! {
    can_parse_an_element_with_an_id,
    r#"
    component A {
        render div refName
    }
    "#
}

add_case! {
    can_parse_a_component_with_a_doccomment,
    r#"
    /**
     * @bounds(width: 100, height: 100, x: -100.5, y: -0.5)
     */
    component A {
        render div
    }
    "#
}

add_case! {
    can_parse_a_document_style,
    r#"
    style {
        background-color: blue
    }
    "#
}

add_case! {
    can_parse_an_empty_style,
    r#"
    style a
    "#
}

add_case! {
    can_parse_a_style_that_extends,
    r#"
    style extends a, b.d.e {
        display: inline-block
        width: blarg
    }
    "#
}

add_case! {
    can_parse_a_style_with_variant_and_extends,
    r#"
    style variant test extends a, b.d.e
    "#
}

add_case! {
    can_parse_a_style_with_variant_and_extends_with_decl,
    r#"
    style ab variant test extends a, b.d.e {
        color: blue
    }
    "#
}

add_case! {
    can_parse_various_public_exprs,
    r#"
    public style
    public component A {
    }
    "#
}

add_case! {
    can_parse_public_component_with_combo_variant,
    r#"
    public component A {
        variant ab
        variant abc
        render div test {
            style variant ab + abc
        }
    }
    "#
}

add_case! {
    can_parse_style_with_unit_decls,
    r#"
    style {
        height: 100vh
        z-index: 99999
    }
    "#
}

add_case! {
    can_parse_css_var,
    r#"
    style {
        background: var(imp0.grey1)
    }
    "#
}

add_case! {
    can_parse_public_token,
    r#"
        public token blackTransparent rgba(1, 0, 0, 0.16)
    "#
}

add_case! {
    can_parse_a_token_with_hex_value,
    r#"token test #F60"#
}

add_case! {
    can_parse_attrs_with_dashes,
    r#"
        div(aria-label: "abba", style: "color: red;")
    "#
}

add_case! {
    can_parse_comma_delim_tokens,
    r#"
        public token defaultFontFamily Inter, sans-serif
    "#
}

add_case! {
    can_set_combo_trigger,
    r#"
        component A {
            render div {
                override {
                    variant b trigger {
                        c + d
                    }
                }
            }
        }
    "#
}

add_case! {
    can_parse_a_syle_without_body,
    r#"
        div {
            style
            text "hello"
        }
    "#
}

add_case! {
    can_parse_a_component_with_a_script,
    r#"
        public component Ab {
            script(src: "./target.js", target: "react")
            render div
        }
    "#
}

add_case! {
    can_parse_a_switch_block,
    r#"
        public component Ab {
            render switch something {
                case "showA" {
                    text "a"
                }
                default {
                    text "b"
                }
            }
        }
    "#
}

add_case! {
    can_parse_a_repeat_block,
    r#"
        public component Ab {
            render repeat items as div {
                text "hello world"
            }
        }
    "#
}
