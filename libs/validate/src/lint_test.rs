use std::collections::HashMap;

use crate::{
    lint::lint_document,
    validate::{validate_document, ValidateOptions},
};
use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_config::LintConfig;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::{
    ast::base::{Range, U16Position},
    notice::base::{Code, Level, Notice, NoticeList},
};
use paperclip_proto_ext::graph::test_utils::{self, MockFS};

#[derive(Clone)]
struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, to: &str) -> Result<String> {
        Ok(to.to_string())
    }
}

fn lint_doc(mock_fs: &MockFS, config: LintConfig) -> NoticeList {
    block_on(validate_document(
        "/entry.pc",
        mock_fs,
        &ValidateOptions::new(config, Options::new(vec!["repeat".to_string()])),
    ))
}

macro_rules! add_case {
    ($name: ident, $input: expr, $config: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($input));
            let result = lint_doc(&mock_fs, $config);
            println!("Try linting");
            println!("{:#?}", result);
            assert_eq!(result, $output);
        }
    };
}

macro_rules! lint_config {
    { $($name: expr => [$([$($value: expr),*]),*]),* } => {{

        let mut map = HashMap::new();

        $(
          let mut rules = vec![];
          $(
              let mut rule = vec![];
              $(
                rule.push($value.to_string());
              )*
              rules.push(rule);
          )*

          map.insert($name.to_string(), rules);
        )*


        LintConfig {
            rules: Some(map)
        }
    }}
}

add_case! {
    can_lint_for_var,
    [("/entry.pc", r#"
        style defaultFont {
            font-family: sans-serif
        }
    "#)],
    lint_config! {
        "vars" => [["error", "font-family"]]
    },
    // || {
    //     LintConfig {
    //         rules: Some(HashMap::from(["vars", vec![vec!["warning".to_string(), "font-family".to_string()]]]))
    //     }
    // },
    NoticeList {
        items: vec![Notice::new(Level::Error, Code::FileNotFound, "File not found".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(9, 2, 9), U16Position::new(39, 3, 5))))]
    }
}
