use super::ast;
use super::parser::parse;
use crate::base::errors::ParserError;
use crate::base::string_scanner::StringScanner;

#[test]
fn can_parse_various_comments() {
    let tests: [(&str, Result<ast::Comment, ParserError>); 1] =
        [("/**/", Ok(ast::Comment { body: vec![] }))];

    for (source, expected_result) in tests {
        let ast = parse(source, &"".to_string());
        assert_eq!(ast, expected_result);
    }
}
