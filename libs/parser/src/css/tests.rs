use super::parser::parse_style_declarations_with_string_scanner;
use super::serializer::serialize_declarations;
use crate::core::string_scanner::StringScanner;
use paperclip_common::id::IDGenerator;
use paperclip_common::str_utils::strip_extra_ws;

macro_rules! add_case {
    ($name: ident, $source: expr) => {
        #[test]
        fn $name() {
            let mut scanner = StringScanner::new($source);
            let mut id_generator = IDGenerator::new("".to_string());

            let parse_result = parse_style_declarations_with_string_scanner(
                &mut scanner,
                &mut id_generator,
                &"".to_string(),
            );

            println!("Try parsing {}", $source);

            if let Ok(ast) = parse_result {
                let output = serialize_declarations(&ast, 0);
                assert_eq!(strip_extra_ws($source), strip_extra_ws(output.as_str()));
            } else if let Err(_) = parse_result {
                panic!("error parsing");
            }
        }
    };
    ($name: ident, $source: expr, $error: expr) => {
        #[test]
        fn $name() {
            let mut scanner = StringScanner::new($source);
            let mut id_generator = IDGenerator::new("".to_string());

            let parse_result = parse_style_declarations_with_string_scanner(
                &mut scanner,
                &mut id_generator,
                &"".to_string(),
            );
            pretty_assertions::assert_eq!(parse_result, $error);
        }
    };
}

add_case! {
    can_parse_color,
    r#"{
        color: red
    }"#
}

add_case! {
    can_parse_unit,
    r#"{
        width: 100px
    }"#
}

add_case! {
    can_parse_spaced_list,
    r#"{
        padding: 10px 10px
    }"#
}

add_case! {
    can_parse_comma_list,
    r#"{
        background: red, blue
    }"#
}

add_case! {
    can_parse_function_call,
    r#"{
        background: var(red)
    }"#
}

add_case! {
    can_parse_func_call_with_params,
    r#"{
        background: var(a, b, c)
    }"#
}

add_case! {
    can_parse_var_call,
    r#"{
        background: var(--abc)
    }"#
}

add_case! {
    can_parse_negative_value,
    r#"{
        background: calc(-50%)
    }"#
}

add_case! {
    can_parse_addition,
    r#"{
        transform: translate(10px + 10px)
    }"#
}
add_case! {
    can_parse_complex_addition,
    r#"{
        transform: translate(-50%, calc(-50% + 1px))
    }"#
}
add_case! {
    can_parse_various_styles,
    r#"{
        filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.1))
        background-image: linear-gradient(rgba(241, 240, 240, 1), rgba(241, 240, 240, 1))
    }"#
}

add_case! {
    can_parse_various_styles_2,
    r#"{
        width: 100%
        boxSizing: border-box
        marginTop: 1px
        user-select: none
        cursor: pointer
        vertical-align: center
        display: flex
        padding-top: 6px
        padding-right: 12px
        padding-bottom: 4px
        align-items: center
        position: relative
        padding-left: 12px
        display: inline-block
        position: relative
        height: 18
        vertical-align: center
    }"#
}

add_case! {
    can_parse_refs,
    r#"{
        color: #444
        box-shadow: inset -1px var(imp0.grey0), inset 2px var(imp0.grey0)
    }"#
}
add_case! {
    can_parse_string,
    r#"{
        text-content: "abba"
    }"#
}

