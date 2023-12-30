use paperclip_config::LintConfig;
use paperclip_proto::ast::css;
use paperclip_proto::ast::css::declaration_value;
use paperclip_proto::ast::graph_ext as graph;
use paperclip_proto::ast::pc;
use paperclip_proto::notice::base as notice;
use paperclip_proto::notice::base::Level;
use paperclip_proto::notice::base::Notice;
use paperclip_proto::notice::base::NoticeList;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug, Clone)]
struct Context<'expr> {
    path: String,
    notices: Rc<RefCell<Vec<notice::Notice>>>,
    config: &'expr LintConfig,
    is_within_var: bool,
}

impl<'expr> Context<'expr> {
    fn within_var(&self) -> Self {
        let mut clone = self.clone();
        clone.is_within_var = true;
        clone
    }
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
        notices: Rc::new(RefCell::new(vec![])),
        path: path.to_string(),
        config,
        is_within_var: false,
    };

    // context.visit_dependency(dep);

    lint_document_body_items(
        dep.document.as_ref().expect("Document must exist"),
        &mut context,
    );

    return notice::NoticeList {
        items: context.notices.borrow().clone(),
    };
}

fn lint_document_body_items(document: &pc::Document, context: &mut Context) {
    for item in &document.body {
        match item.get_inner() {
            pc::document_body_item::Inner::Component(expr) => {
                lint_component(expr, context);
            }
            pc::document_body_item::Inner::Atom(_) => {}
            pc::document_body_item::Inner::DocComment(_) => {
                // TODO
            }
            pc::document_body_item::Inner::Element(expr) => {
                lint_element(expr, context);
            }
            pc::document_body_item::Inner::Text(expr) => {
                lint_text_node(expr, context);
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

fn lint_element(expr: &pc::Element, context: &mut Context) {
    for child in &expr.body {
        lint_node(child, context);
    }
}

fn lint_text_node(expr: &pc::TextNode, context: &mut Context) {
    for child in &expr.body {
        lint_node(child, context);
    }
}

fn lint_insert(expr: &pc::Insert, context: &mut Context) {
    for child in &expr.body {
        lint_node(child, context);
    }
}

fn lint_slot(expr: &pc::Slot, context: &mut Context) {
    for child in &expr.body {
        lint_node(child, context);
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
                lint_decl_value(decl_name, item, &mut context.within_var());
            }
        }

        // leaf
        declaration_value::Inner::Number(_)
        | declaration_value::Inner::Reference(_)
        | declaration_value::Inner::Str(_)
        | declaration_value::Inner::HexColor(_)
        | declaration_value::Inner::Measurement(_) => {
            if !context.is_within_var {
                if let Some(level) =
                    get_lint_notice_level("noMagicValue", "font-family", &context.config)
                {
                    context.notices.borrow_mut().push(Notice::lint_magic_value(
                        level,
                        &context.path,
                        &decl.get_range(),
                    ))
                }
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
            pc::component_body_item::Inner::Render(expr) => {
                lint_render(expr, context);
            }
            pc::component_body_item::Inner::Variant(expr) => {
                // TODO
            }
        }
    }
}

fn lint_render(expr: &pc::Render, context: &mut Context) {
    lint_node(expr.node.as_ref().expect("Node must exist"), context);
}

fn lint_condition(expr: &pc::Condition, context: &mut Context) {
    for item in &expr.body {
        lint_node(item, context);
    }
}

fn lint_node(expr: &pc::Node, context: &mut Context) {
    match expr.get_inner() {
        pc::node::Inner::Condition(expr) => {
            lint_condition(expr, context);
        }
        pc::node::Inner::Element(expr) => {
            lint_element(expr, context);
        }
        pc::node::Inner::Text(expr) => {
            lint_text_node(expr, context);
        }
        pc::node::Inner::Insert(expr) => {
            lint_insert(expr, context);
        }
        pc::node::Inner::Repeat(expr) => {
            // TODO
        }
        pc::node::Inner::Script(expr) => {
            // TODO
        }
        pc::node::Inner::Style(expr) => {
            lint_style(expr, context);
        }
        pc::node::Inner::Slot(expr) => {
            lint_slot(expr, context);
        }
        pc::node::Inner::Override(_) | pc::node::Inner::Switch(_) => {
            panic!("Not implemented yet");
        }
    }
}
