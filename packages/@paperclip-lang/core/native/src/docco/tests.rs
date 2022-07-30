use super::ast;
use super::parser::parse;
use crate::core::errors::ParserError;
use crate::core::string_scanner::StringScanner;

#[test]
fn can_parse_various_comments() {
    let tests: Vec<(&str, Result<ast::Comment, ParserError>)> =
        vec![("/**/", Ok(ast::Comment { body: vec![] }))];

    for (source, expected_result) in tests {
        let ast = parse(source, &"".to_string());
        assert_eq!(ast, expected_result);
    }
}
