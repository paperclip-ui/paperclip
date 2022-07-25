use super::ast;
use super::errors as err;
use super::parser::parse;
use super::serializer::serialize;

use crate::base::ast::{Range, U16Position};
use pretty_assertions;
use textwrap::{dedent};

#[test]
fn can_parse_various_contents() {


    let tests: [(&str, Result<(), err::ParserError>); 9] = [
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
        (r#"
            component A {
            }
        "#, Ok(())),
        (r#"
            component A {
                render div
            }
        "#, Ok(())),
        (r#"
            component A {
                render text "hello world"
            }
        "#, Ok(())),
        (r#"
            component A {
                render text "hello world" {
                    style {
                        color: red
                    }
                }
            }
        "#, Ok(())),
    ];

    for (source, result) in tests {
        let parse_result = parse(source, &"".to_string());
        println!("Try parsing {}", source);

        if let Ok(ast) = parse_result {
            let output = serialize(&ast);
            assert_eq!(dedent(source).trim(), output.trim());
        } else if let Err(err) = parse_result {
            pretty_assertions::assert_eq!(Err(err), result);
        }
    }
}