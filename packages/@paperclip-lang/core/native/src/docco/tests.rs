use super::ast;
use super::parser::parse;
use crate::base::ast::{U16Position, Range};
use crate::core::errors::ParserError;
use super::serialize::serialize;
use crate::core::string_scanner::StringScanner;

#[test]
fn can_parse_various_comments() {
    let tests: Vec<(&str, Result<(), ParserError>)> = vec![
        (
            "/***/",
            Ok(()),
        ),
        (
            "/** This is some text */",
            Ok(()),
        ),
    ];

    for (source, expected_result) in tests {
        let result = parse(source, &"".to_string());
        if let Ok(ast) = result {
            assert_eq!(source, serialize(&ast));
        } else if let Err(err) = result {
            assert_eq!(Err(err), expected_result);
        }
    }
}
