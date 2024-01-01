use std::collections::HashMap;

use anyhow::Result;
use futures::executor::block_on;
use paperclip_common::fs::FileResolver;
use paperclip_core::proto::graph::test_utils::{self, MockFS};
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::{
    ast::base::{Range, U16Position},
    notice::base::{Code, Level, Notice, NoticeList},
};

use crate::validate::{validate_document, ValidateOptions};

#[derive(Clone)]
struct MockResolver;
impl FileResolver for MockResolver {
    fn resolve_file(&self, _from: &str, to: &str) -> Result<String> {
        Ok(to.to_string())
    }
}

fn validate_doc(mock_fs: &MockFS) -> NoticeList {
    block_on(validate_document(
        "/entry.pc",
        mock_fs,
        &ValidateOptions::from_parse_options(Options::new(vec!["repeat".to_string()])),
    ))
}

macro_rules! add_case {
    ($name: ident, $input: expr, $output: expr) => {
        #[test]
        fn $name() {
            let mock_fs = test_utils::MockFS::new(HashMap::from($input));
            let result = validate_doc(&mock_fs);
            println!("Try evaluating");
            println!("{:#?}", result);
            assert_eq!(result, $output);
        }
    };
}

add_case! {
    can_validate_a_simple_doc,
    [("/entry.pc", "div")],
    NoticeList {
        items: vec![]
    }
}

add_case! {
    can_validate_a_doc_with_missing_import,
    [("/entry.pc", r#"
        import "/test.pc" as test
    "#)],
    NoticeList {
        items: vec![Notice::new(Level::Error, Code::FileNotFound, "File not found".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(9, 2, 9), U16Position::new(39, 3, 5))))]
    }
}

add_case! {
    can_validate_a_missing_style_ref,
    [("/entry.pc", r#"
        style test extends missing {

        }
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(28, 2, 28), U16Position::new(35, 2, 35))))]
    }
}

add_case! {
    can_validate_a_missing_token,
    [("/entry.pc", r#"
        style font {
            font-family: var(missing)
        }
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(51, 3, 30), U16Position::new(58, 3, 37))))]
    }
}

add_case! {
    can_validate_a_missing_variant_trigger,
    [("/entry.pc", r#"
        component ABC {
            variant test trigger {
                missing
            }
            render div
        }
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(76, 4, 17), U16Position::new(83, 4, 24))))]
    }
}

add_case! {
    can_validate_a_missing_variant,
    [("/entry.pc", r#"
        component ABC {
            render div {
                style variant missing
            }
        }
    "#)],
    NoticeList {
        items: vec![Notice::new(Level::Error, Code::ReferenceNotFound, "Reference not found".to_string(), Some("/entry.pc".to_string()), Some(Range::new(U16Position::new(80, 4, 31), U16Position::new(87, 4, 38))))]
    }
}

add_case! {
    can_validate_a_missing_instance,
    [("/entry.pc", r#"
        Missing
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(9, 2, 9), U16Position::new(16, 2, 16))))]
    }
}

add_case! {
    can_validate_a_missing_import,
    [("/entry.pc", r#"
        core.Missing
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(9, 2, 9), U16Position::new(21, 2, 21))))]
    }
}

add_case! {
    can_validate_a_missing_instance_import,
    [("/entry.pc", r#"
    import "./core.pc" as core
    core.Missing
"#), ("/core.pc", r#""#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(36, 3, 5), U16Position::new(48, 3, 17))))]

    }
}

add_case! {
    can_validate_a_missing_css_url,
    [("/entry.pc", r#"
        style something {
            background: url("./missing.svg")
        }
    "#)],
    NoticeList {
        items: vec![Notice::file_not_found("/entry.pc", &Some(Range::new(U16Position::new(55, 3, 29), U16Position::new(70, 3, 44))))]
    }
}

add_case! {
    can_validate_a_missing_img,
    [("/entry.pc", r#"
        img(src: "missing.svg")
    "#)],
    NoticeList {
        items: vec![Notice::file_not_found("/entry.pc", &Some(Range::new(U16Position::new(9, 2, 9), U16Position::new(37, 3, 5))))]
    }
}

add_case! {
    can_validate_a_missing_tag_name,
    [("/entry.pc", r#"
        component A {
            render Tag.Tag {

            }
        }
    "#)],
    NoticeList {
        items: vec![Notice::reference_not_found("/entry.pc", &Some(Range::new(U16Position::new(42, 3, 20), U16Position::new(49, 3, 27))))]
    }
}

add_case! {
    element_params_arent_linted,
    [("/entry.pc", r#"
        component A {
            render div(onClick: onClick) {

            }
        }
    "#)],
    NoticeList {
        items: vec![]
    }
}
