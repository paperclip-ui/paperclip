use super::ast;
use super::parser::parse_style_declarations_with_string_scanner;
use super::serializer::serialize_declarations;
use crate::core::errors as err;
use crate::core::string_scanner::StringScanner;
use paperclip_common::id::IDGenerator;

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
              background: var(--abc)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: var(--abc)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: calc(50%)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              background: calc(-50%)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              transform: translate(10px + 10px)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              transform: translate(-50%, calc(-50% + 1px))
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.1))
              background-image: linear-gradient(rgba(241, 240, 240, 1), rgba(241, 240, 240, 1))
          }
        "#,
            Ok(()),
        ),
        // Smoke tests
        (
            r#"
          {
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
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              color: #444
              box-shadow: inset -1px var(imp0.grey0), inset 2px var(imp0.grey0)
          }
        "#,
            Ok(()),
        ),
        (
            r#"
          {
              text-content: "abba"
          }
        "#,
            Ok(()),
        ),
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
