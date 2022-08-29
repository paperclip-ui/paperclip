use super::ast;
use super::parser::parse;
use super::serialize::serialize;
use crate::base::ast::{Range, U16Position};
use crate::core::errors::ParserError;

#[test]
fn can_parse_various_comments() {
    let tests: Vec<(&str, Result<(), ParserError>)> = vec![
        ("/***/", Ok(())),
        ("/** This is some text */", Ok(())),
        ("/** This is some text @name \"value\" */", Ok(())),
        (
            "/** This is some text @name \"value\" some other text */",
            Ok(()),
        ),
        (
            "/** 
              * This is some random text 
              * @name \"this is a value \"
              */",
            Ok(()),
        ),
        (
            "/** 
              * This is some random text 
              * @name \"this is a value \"
              * @bounds(width: 100, height: 200, x: -100, y: -100.5)
              */",
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
