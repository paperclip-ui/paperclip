use paperclip_ast_serialize::css::serialize_decl_value;
use paperclip_common::get_or_short;
use paperclip_common::serialize_context::Context as SerializeContext;
use paperclip_core::config::LintConfig;

use paperclip_proto::{
    ast::{
        all::visit::{Visitable, Visitor, VisitorResult},
        css::{declaration_value, DeclarationValue, FunctionCall, StyleDeclaration},
        graph,
    },
    notice::base::{Level, Notice, NoticeList},
};

use std::cell::RefCell;
use std::rc::Rc;

#[derive(Clone)]
struct Linter<'a> {
    path: &'a str,
    current_decl_name: Option<String>,
    is_within_var: bool,
    config: &'a LintConfig,
    notices: Rc<RefCell<NoticeList>>,
}

impl<'a> Visitor<()> for Linter<'a> {
    fn visit_css_function_call(&self, expr: &Box<FunctionCall>) -> VisitorResult<(), Self> {
        if expr.name == "var" {
            VisitorResult::Map(Box::new(Linter {
                is_within_var: true,
                ..self.clone()
            }))
        } else {
            VisitorResult::Continue
        }
    }
    fn visit_css_declaration(&self, item: &StyleDeclaration) -> VisitorResult<(), Self> {
        VisitorResult::Map(Box::new(Linter {
            current_decl_name: Some(item.name.to_string()),
            ..self.clone()
        }))
    }
    fn visit_css_declaration_value(&self, item: &DeclarationValue) -> VisitorResult<(), Self> {
        let decl_name = get_or_short!(&self.current_decl_name, VisitorResult::Continue);

        match item.get_inner() {
            declaration_value::Inner::Number(_)
            | declaration_value::Inner::Reference(_)
            | declaration_value::Inner::Keyword(_)
            | declaration_value::Inner::Str(_)
            | declaration_value::Inner::HexColor(_)
            | declaration_value::Inner::Measurement(_) => {
                if !self.is_within_var {
                    if let Some(level) =
                        get_lint_notice_level("enforceVars", &decl_name, &self.config)
                    {
                        let mut serialize = SerializeContext::new(0);
                        serialize_decl_value(item, &mut serialize);

                        if !matches!(
                            serialize.buffer.as_str(),
                            "0" | "0px"
                                | "currentColor"
                                | "initial"
                                | "inherit"
                                | "unset"
                                | "revert"
                                | "auto"
                        ) {
                            self.notices.borrow_mut().push(Notice::lint_magic_value(
                                level,
                                &self.path,
                                &item.get_range(),
                            ))
                        }
                    }
                }
            }

            _ => {}
        }

        VisitorResult::Continue
    }
}

fn get_lint_notice_level(lint_name: &str, expr_name: &str, config: &LintConfig) -> Option<Level> {
    let rules = if let Some(rules) = &config.rules {
        rules
    } else {
        return None;
    };

    let rules = if let Some(rules) = rules.get(lint_name) {
        rules
    } else {
        return None;
    };

    for option in rules {
        if let Some(level_str) = option.get(0) {
            let level = if matches!(level_str.as_str(), "error") {
                Some(Level::Error)
            } else if matches!(level_str.as_str(), "warning") {
                Some(Level::Warning)
            } else {
                None
            };

            if option.contains(&expr_name.to_string()) || option.contains(&"*".to_string()) {
                return level;
            }
        }
    }

    None
}

pub fn lint_document<'expr>(
    path: &str,
    graph: &'expr graph::Graph,
    config: &LintConfig,
) -> NoticeList {
    let dep = graph.dependencies.get(path).expect("Dependency must exist");

    let linter = Linter {
        path,
        current_decl_name: None,
        is_within_var: false,
        config,
        notices: Rc::new(RefCell::new(NoticeList::new())),
    };

    dep.document
        .as_ref()
        .expect("Document must exist")
        .accept(&linter);

    let notices = linter.notices.borrow();

    notices.clone()
}
