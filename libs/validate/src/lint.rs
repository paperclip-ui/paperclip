use paperclip_config::LintConfig;
use paperclip_proto::ast::css;
use paperclip_proto::ast::css::declaration_value;
use paperclip_proto::ast::graph_ext as graph;
use paperclip_proto::ast::pc;
use paperclip_proto::notice::base as notice;
use paperclip_proto::notice::base::Level;
use paperclip_proto::notice::base::NoticeList;

struct Context<'expr> {
    path: String,
    current_style_name: Option<String>,
    graph: &'expr graph::Graph,
    notices: Vec<notice::Notice>,
    config: &'expr LintConfig,
}

/*
TODO:

- Check to make sure that instance exists
  - Follow instances and look for component. Should throw NotFound error
- lint styles
    - lint url() imports
    - lint vars
    - lint style refs
    - lint variant refs
    - lint variant refs
*/
pub fn lint_document<'expr>(
    path: &str,
    graph: &'expr graph::Graph,
    config: &LintConfig,
) -> NoticeList {
    let dep = graph.dependencies.get(path).expect("Dependency must exist");

    let mut context = Context {
        notices: vec![],
        path: path.to_string(),
        graph,
        config,
        current_style_name: None,
    };

    lint_document_body_items(
        dep.document.as_ref().expect("Document must exist"),
        &mut context,
    );

    return notice::NoticeList {
        items: context.notices,
    };
}

fn lint_document_body_items(document: &pc::Document, context: &mut Context) {
    for item in &document.body {
        match item.get_inner() {
            pc::document_body_item::Inner::Component(_) => {}
            pc::document_body_item::Inner::Atom(_) => {}
            pc::document_body_item::Inner::DocComment(_) => {
                // TODO
            }
            pc::document_body_item::Inner::Element(_) => {
                // TODO
            }
            pc::document_body_item::Inner::Text(_) => {
                // TODO
            }
            pc::document_body_item::Inner::Trigger(_) => {
                // TODO
            }
            pc::document_body_item::Inner::Style(style) => {
                lint_style(style, context);
            }
            pc::document_body_item::Inner::Import(_) => {
                // TODO
            }
        }
    }
}

fn lint_style(style: &pc::Style, context: &mut Context) {
    for decl in &style.declarations {
        lint_style_declaration(decl, context);
    }
}

fn lint_style_declaration(decl: &css::StyleDeclaration, context: &mut Context) {
    lint_decl_value(
        &decl.name,
        decl.value.as_ref().expect("Value must exist"),
        context,
    );
}

fn lint_decl_value(decl_name: &str, decl: &css::DeclarationValue, context: &mut Context) {
    match decl.get_inner() {
        declaration_value::Inner::Arithmetic(expr) => {
            lint_decl_value(
                decl_name,
                expr.left.as_ref().expect("Left must exist"),
                context,
            );
            lint_decl_value(
                decl_name,
                expr.right.as_ref().expect("Left must exist"),
                context,
            );
        }
        declaration_value::Inner::CommaList(expr) => {
            for item in &expr.items {
                lint_decl_value(decl_name, item, context);
            }
        }
        declaration_value::Inner::SpacedList(expr) => {
            for item in &expr.items {
                lint_decl_value(decl_name, item, context);
            }
        }
        declaration_value::Inner::FunctionCall(expr) => {
            for item in &expr.arguments {
                lint_decl_value(decl_name, item, context);
            }
        }

        // leaf
        declaration_value::Inner::Number(_)
        | declaration_value::Inner::Str(_)
        | declaration_value::Inner::Reference(_)
        | declaration_value::Inner::HexColor(_)
        | declaration_value::Inner::Measurement(_) => {
            if let Some(level) = get_lint_notice_level("var", decl_name, context.config) {
                context.notices.push(notice::Notice::lint_magic_value(
                    level,
                    &context.path,
                    decl.get_range(),
                ))
            }
        }
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

            if option.contains(&expr_name.to_string()) {
                return level;
            }
        }
    }

    None
}

fn lint_component(component: &pc::Component, context: &mut Context) {
    for item in &component.body {
        match item.get_inner() {
            pc::component_body_item::Inner::Script(expr) => {
                // TODO
            }
            pc::component_body_item::Inner::Render(expr) => {}
            pc::component_body_item::Inner::Variant(expr) => {
                // TODO
            }
        }
    }
}

fn lint_render(expr: &pc::Render, context: &mut Context) {}

fn lint_node(expr: &pc::Node, context: &mut Context) {
    match expr.get_inner() {
        pc::node::Inner::Condition(expr) => {
            // TODO
        }
        pc::node::Inner::Element(expr) => {
            // TODO
        }
        pc::node::Inner::Text(expr) => {
            // TODO
        }
        pc::node::Inner::Insert(expr) => {
            // TODO
        }
        pc::node::Inner::Override(expr) => {
            // TODO
        }
        pc::node::Inner::Repeat(expr) => {
            // TODO
        }
        pc::node::Inner::Script(expr) => {
            // TODO
        }
        pc::node::Inner::Style(expr) => {
            // TODO
        }
        pc::node::Inner::Slot(expr) => {
            // TODO
        }
        pc::node::Inner::Switch(expr) => {
            // TODO
        }
    }
}
