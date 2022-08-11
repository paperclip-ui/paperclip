use super::ast;
use super::parser::parse_style_declarations_with_string_scanner;
use super::serializer::serialize_declarations;
use crate::core::errors as err;
use crate::core::id::IDGenerator;
use crate::core::string_scanner::StringScanner;

use crate::base::ast::{Range, U16Position};
use pretty_assertions;
use textwrap::dedent;

#[test]
fn can_parse_various_contents() {
    let tests: Vec<(&str, Result<(), err::ParserError>)> = vec![
        (
            r#"
          {
              color: red
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              width: 100px
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              padding: 10px 10px
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: red, blue
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: var(red)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: var(a, b, c)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: var(--color)
          }
        "#,
            Ok(()),
        )
    ];

    for (source, result) in tests {
        let mut scanner = StringScanner::new(source);
        let mut id_generator = IDGenerator::new("".to_string());

        let parse_result = parse_style_declarations_with_string_scanner(
            &mut scanner,
            &mut id_generator,
            &"".to_string(),
        );
        println!("Try parsing {}", source);

        if let Ok(ast) = parse_result {
            let output = serialize_declarations(&ast, 0);
            assert_eq!(dedent(source).trim(), dedent(output.as_str()).trim());
        } else if let Err(err) = parse_result {
            pretty_assertions::assert_eq!(Err(err), result);
        }
    }
}
