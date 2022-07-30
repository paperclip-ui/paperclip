use super::ast;
use super::parser::parse;
use crate::base::ast::U16Position;
use crate::core::errors::ParserError;
use crate::core::string_scanner::StringScanner;

#[test]
fn can_parse_various_comments() {
    let tests: Vec<(&str, Result<ast::Comment, ParserError>)> =
        vec![
            ("/**/", Ok(ast::Comment { id: "".to_string(), range: Range.now(U16Position::new(0, 0, 0), U16Position::new(0,0,0)), body: vec![] })),
            ("/** This is some text */", Ok(ast::Comment {
                body: vec![
                    ast::CommentBodyItem::Text(b"This is some text")
                ]
            }))
        ];

    for (source, expected_result) in tests {
        let ast = parse(source, &"".to_string());
        assert_eq!(ast, expected_result);
    }
}
