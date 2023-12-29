// use std::collections::HashMap;

// use crate::{
//     lint::lint_document,
//     validate::{validate_document, ValidateOptions},
// };
// use anyhow::Result;
// use futures::executor::block_on;
// use paperclip_common::fs::FileResolver;
// use paperclip_config::LintConfig;
// use paperclip_parser::core::parser_context::Options;
// use paperclip_proto::{
//     ast::base::{Range, U16Position},
//     notice::base::{Code, Level, Notice, NoticeList},
// };
// use paperclip_proto_ext::graph::test_utils::{self, MockFS};

// #[derive(Clone)]
// struct MockResolver;
// impl FileResolver for MockResolver {
//     fn resolve_file(&self, _from: &str, to: &str) -> Result<String> {
//         Ok(to.to_string())
//     }
// }

// fn lint_doc(mock_fs: &MockFS, config: LintConfig) -> NoticeList {
//     block_on(validate_document(
//         "/entry.pc",
//         mock_fs,
//         &ValidateOptions::new(config, Options::new(vec!["repeat".to_string()])),
//     ))
// }

// macro_rules! add_case {
//     ($name: ident, $input: expr, $config: expr, $output: expr) => {
//         #[test]
//         fn $name() {
//             let mock_fs = test_utils::MockFS::new(HashMap::from($input));
//             let result = lint_doc(&mock_fs, $config);
//             println!("Try linting");
//             println!("{:#?}", result);
//             assert_eq!(result, $output);
//         }
//     };
// }

// macro_rules! lint_config {
//     { $($name: expr => [$([$($value: expr),*]),*]),* } => {{

//         let mut map = HashMap::new();

//         $(
//           let mut rules = vec![];
//           $(
//               let mut rule = vec![];
//               $(
//                 rule.push($value.to_string());
//               )*
//               rules.push(rule);
//           )*

//           map.insert($name.to_string(), rules);
//         )*

//         LintConfig {
//             rules: Some(map)
//         }
//     }}
// }

// add_case! {
//     can_lint_for_var,
//     [("/entry.pc", r#"
//         style defaultFont {
//             font-family: sans-serif
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }

// add_case! {
//     can_lint_a_var,
//     [("/entry.pc", r#"
//         token fontFamily sans-serif
//         style defaultFont {
//             font-family: var(fontFamily)
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![]
//         // items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }
// add_case! {
//     can_lint_a_style_in_a_component,
//     [("/entry.pc", r#"
//         component A {
//             render div {
//                 style {
//                     font-family: sans-serif
//                 }
//             }
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }

// add_case! {
//     can_list_a_style_in_a_slot,
//     [("/entry.pc", r#"
//         component A {
//             render div {
//                 slot a {
//                     div {
//                         style {
//                             font-family: sans-serif
//                         }
//                     }
//                 }
//             }
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }

// add_case! {
//     can_list_a_style_in_an_insert,
//     [("/entry.pc", r#"
//         component A {
//             render div {
//                 insert a {
//                     div {
//                         style {
//                             font-family: sans-serif
//                         }
//                     }
//                 }
//             }
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }

// add_case! {
//     can_list_a_style_in_a_text_node,
//     [("/entry.pc", r#"
//         component A {
//             render div {
//                 text a {
//                     style {
//                         font-family: sans-serif
//                     }
//                 }
//             }
//         }
//     "#)],
//     lint_config! {
//         "vars" => [["error", "font-family"]]
//     },
//     NoticeList {
//         items: vec![Notice::new(Level::Error, Code::LintMagicValue, "Unexpected value. This should be elevated to a variable.".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(54, 3, 26), U16Position::new(64, 3, 36))))]
//     }
// }
