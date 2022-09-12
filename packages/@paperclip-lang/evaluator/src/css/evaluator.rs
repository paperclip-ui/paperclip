use super::context::{CurrentNode, DocumentContext};
use super::errors;
use super::virt;
use crate::core::utils::get_style_namespace;
use paperclip_common::fs::FileResolver;
use paperclip_common::id::get_document_id;
use paperclip_parser::css::ast as css_ast;
use paperclip_parser::graph::graph;
use paperclip_parser::graph::reference as graph_ref;
use paperclip_parser::pc::ast;
use std::rc::Rc;

#[derive(Debug)]
enum VariantTrigger {
    Boolean(bool),
    Selector(String),
}

type SelectorCombo = Vec<String>;
type SelectorCombos = Vec<SelectorCombo>;

// TODO - scan for all tokens and shove in root
pub async fn evaluate<'asset_resolver, FR: FileResolver>(
    path: &str,
    graph: &graph::Graph,
    file_resolver: &'asset_resolver FR,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    let dependency = if let Some(dependency) = dependencies.get(path) {
        dependency
    } else {
        return Err(errors::RuntimeError {
            message: "not found".to_string(),
        });
    };

    let mut context = DocumentContext::new(path, graph, file_resolver);

    evaluate_document(&dependency.document, &mut context);

    Ok(Rc::try_unwrap(context.document).unwrap().into_inner())
}

fn evaluate_document<F: FileResolver>(document: &ast::Document, context: &mut DocumentContext<F>) {
    evaluate_tokens(document, context);
    evaluate_document_rules(document, context);
}

fn evaluate_tokens<F: FileResolver>(document: &ast::Document, context: &mut DocumentContext<F>) {
    let atoms = document.get_atoms();

    if atoms.len() == 0 {
        return;
    }

    let id = context.next_id();

    context
        .document
        .borrow_mut()
        .rules
        .push(virt::Rule::Style(virt::StyleRule {
            id,
            source_id: None,
            selector_text: ":root".to_string(),
            style: atoms
                .iter()
                .map(|atom| virt::StyleDeclaration {
                    id: atom.id.to_string(),
                    source_id: atom.id.to_string(),
                    name: format!("--{}", atom.id),
                    value: evaluate_atom(atom, context),
                })
                .collect(),
        }))
}
fn evaluate_document_rules<F: FileResolver>(
    document: &ast::Document,
    context: &mut DocumentContext<F>,
) {
    for item in &document.body {
        evaluate_body_rule(item, context);
    }
}

fn evaluate_body_rule<F: FileResolver>(
    item: &ast::DocumentBodyItem,
    context: &mut DocumentContext<F>,
) {
    match item {
        ast::DocumentBodyItem::Component(component) => {
            evaluate_component(component, context);
        }
        ast::DocumentBodyItem::Element(component) => {
            evaluate_element(component, context);
        }
        ast::DocumentBodyItem::Text(text) => {
            evaluate_text(text, context);
        }
        _ => {}
    }
}

fn evaluate_component<F: FileResolver>(
    component: &ast::Component,
    context: &mut DocumentContext<F>,
) {
    for item in &component.body {
        if let ast::ComponentBodyItem::Render(render) = item {
            evaluate_render_node(&render.node, &mut context.within_component(component));
        }
    }
}

fn evaluate_render_node<F: FileResolver>(node: &ast::RenderNode, context: &mut DocumentContext<F>) {
    match node {
        ast::RenderNode::Element(element) => {
            evaluate_element(element, context);
        }
        ast::RenderNode::Text(element) => {
            evaluate_text(element, context);
        }
        _ => {}
    }
}

fn evaluate_element<F: FileResolver>(element: &ast::Element, context: &mut DocumentContext<F>) {
    let mut el_context = context.within_node(CurrentNode::Element(element));

    for item in &element.body {
        match item {
            ast::ElementBodyItem::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
            ast::ElementBodyItem::Element(expr) => {
                evaluate_element(expr, &mut el_context);
            }
            ast::ElementBodyItem::Text(expr) => {
                evaluate_text(expr, &mut el_context);
            }
            _ => {}
        }
    }
}
fn evaluate_text<F: FileResolver>(element: &ast::TextNode, context: &mut DocumentContext<F>) {
    let mut el_context = context.within_node(CurrentNode::TextNode(element));

    for item in &element.body {
        match item {
            ast::TextNodeBodyItem::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
            _ => {}
        }
    }
}

fn evaluate_style<F: FileResolver>(style: &ast::Style, context: &mut DocumentContext<F>) {
    if let Some(variants) = &style.variant_combo {
        let expanded_combo_selectors = collect_style_variant_selectors(variants, context);
        evaluate_variant_styles(&style, variants, &expanded_combo_selectors, context);
    } else {
        evaluate_vanilla_style(style, context)
    }
}

fn evaluate_variant_styles<F: FileResolver>(
    style: &ast::Style,
    variants: &Vec<ast::Reference>,
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
    context: &mut DocumentContext<F>,
) {
    let current_component = if let Some(component) = context.current_component {
        component
    } else {
        return;
    };

    let render_node = if let Some(render) = current_component.get_render_expr() {
        &render.node
    } else {
        return;
    };

    let current_node = if let Some(node) = &context.current_node {
        node
    } else {
        return;
    };

    let ns = get_style_namespace(
        current_node.get_name(),
        current_node.get_id(),
        &get_document_id(context.path),
        context.current_component,
    );

    let render_node_ns = get_style_namespace(
        match render_node {
            ast::RenderNode::Element(expr) => &expr.name,
            ast::RenderNode::Text(expr) => &expr.name,
            _ => &None,
        },
        &render_node.get_id(),
        &get_document_id(context.path),
        context.current_component,
    );

    let is_render_node = render_node_ns == ns;

    let evaluated_style = create_style_declarations(style, context);

    let mut assoc_variants = vec![];

    for variant in variants {
        for item in &current_component.body {
            if let ast::ComponentBodyItem::Variant(variant2) = item {
                if variant.path.get(0) == Some(&variant2.name) {
                    assoc_variants.push(variant2);
                }
            }
        }
    }

    for assoc_variant in assoc_variants {
        let virt_style = virt::Rule::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text: format!(
                ".{}.{}{}",
                render_node_ns,
                assoc_variant.id,
                if is_render_node {
                    "".to_string()
                } else {
                    format!(" .{}", ns)
                }
            ),
            style: evaluated_style.clone(),
        });
        context.document.borrow_mut().rules.push(virt_style);
    }

    // first up,

    let (combo_queries, combo_selectors) = get_combo_selectors(expanded_combo_selectors);

    let virt_styles = if combo_selectors.len() > 0 {
        combo_selectors
            .iter()
            .map(|group_selectors| {
                virt::Rule::Style(virt::StyleRule {
                    id: context.next_id(),
                    source_id: Some(style.id.to_string()),
                    selector_text: format!(
                        ".{}{}{}",
                        render_node_ns,
                        group_selectors.join(""),
                        if is_render_node {
                            "".to_string()
                        } else {
                            format!(" .{}", ns)
                        }
                    ),
                    style: evaluated_style.clone(),
                })
            })
            .collect::<Vec<virt::Rule>>()
    } else {
        vec![virt::Rule::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text: format!(
                ".{}{}",
                render_node_ns,
                if is_render_node {
                    "".to_string()
                } else {
                    format!(" .{}", ns)
                }
            ),
            style: evaluated_style.clone(),
        })]
    };

    for virt_style in virt_styles {
        for container_queries in &combo_queries {
            let container_rule =
                container_queries
                    .iter()
                    .fold(virt_style.clone(), |rule, container_query| {
                        if container_query.starts_with("@media") {
                            virt::Rule::Media(create_condition_rule(
                                "media",
                                container_query,
                                vec![rule],
                                context,
                            ))
                        } else if container_query.starts_with("@supports") {
                            virt::Rule::Supports(create_condition_rule(
                                "supports",
                                container_query,
                                vec![rule],
                                context,
                            ))
                        } else {
                            rule
                        }
                    });

            context.document.borrow_mut().rules.push(container_rule);
        }
    }
}

fn create_condition_rule<F: FileResolver>(
    name: &str,
    container_query: &str,
    rules: Vec<virt::Rule>,
    context: &mut DocumentContext<F>,
) -> virt::ConditionRule {
    virt::ConditionRule {
        id: context.next_id(),
        name: name.to_string(),
        condition_text: substr(name.len() + 2, container_query),
        rules,
    }
}

fn substr(start: usize, value: &str) -> String {
    value.chars().skip(start).take(value.len()).collect()
}

/*

[
    ["@a", "@b", "@c"],
    [".selector", "@e", "@f", "@g", ".something"],
    [":nth-child(2n)", "@supports mobile", "@h", "@i"]
]

["@a"]
["@b"]
["@c"]

["@a", "@e"]
["@a", "@f"]

["@a", "@e", "@h"]
["@a", "@e", "@i"]
["@a", "@g"]
["@a", "@g"]


@media screen and (max-width: 100px) {
    @media screen and (min-width: 30px) {

    }
}

*/

fn get_combo_selectors(
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
) -> (SelectorCombos, SelectorCombos) {
    let mut combo_container_queries: SelectorCombos = vec![];
    let mut combo_selectors: SelectorCombos = vec![];

    for group in expanded_combo_selectors {
        let mut container_queries = vec![];
        let mut selectors = vec![];

        for selector in group {
            if let VariantTrigger::Selector(selector) = selector {
                if selector.starts_with("@") {
                    container_queries.push(selector);
                } else {
                    selectors.push(selector);
                }
            }
        }

        combo_container_queries = merge_combos(&combo_container_queries, &container_queries);
        combo_selectors = merge_combos(&combo_selectors, &selectors);
    }

    (combo_container_queries, combo_selectors)
}

fn merge_combos(existing_combos: &SelectorCombos, new_items: &Vec<&String>) -> SelectorCombos {
    if new_items.len() == 0 {
        return existing_combos.clone();
    }

    let mut new_combos: SelectorCombos = vec![];
    for item in new_items {
        for combo in existing_combos {
            let mut new_combo = combo.clone();
            new_combo.push(item.to_string());
            new_combos.push(new_combo);
        }

        if existing_combos.len() == 0 {
            new_combos.push(vec![item.to_string()]);
        }
    }

    new_combos
}

fn collect_style_variant_selectors<F: FileResolver>(
    variant_refs: &Vec<ast::Reference>,
    context: &mut DocumentContext<F>,
) -> Vec<Vec<VariantTrigger>> {
    let mut combo_triggers = vec![];

    // TODO - need to also include variant _class_

    if let Some(component) = context.current_component {
        for variant_ref in variant_refs {
            if variant_ref.path.len() == 1 {
                let variant = component.get_variant(variant_ref.path.get(0).unwrap());
                if let Some(variant) = variant {
                    let mut triggers = vec![];
                    collect_triggers(&variant.triggers, &mut triggers, context);
                    combo_triggers.push(triggers);
                }
            }
        }
    }

    combo_triggers
}

fn collect_triggers<F: FileResolver>(
    triggers: &Vec<ast::TriggerBodyItem>,
    into: &mut Vec<VariantTrigger>,
    context: &mut DocumentContext<F>,
) {
    for trigger in triggers {
        match trigger {
            ast::TriggerBodyItem::Boolean(expr) => {
                into.push(VariantTrigger::Boolean(expr.value));
            }
            ast::TriggerBodyItem::String(expr) => {
                into.push(VariantTrigger::Selector(expr.value.to_string()));
            }
            ast::TriggerBodyItem::Reference(expr) => {
                if let Some(info) = context.graph.get_ref(&expr.path, context.path) {
                    if let graph_ref::Expr::Trigger(trigger) = &info.expr {
                        collect_triggers(&trigger.body, into, context);
                    }
                }
            }
        }
    }
}

fn evaluate_atom<F: FileResolver>(atom: &ast::Atom, context: &DocumentContext<F>) -> String {
    stringify_style_decl_value(&atom.value, context)
}

fn evaluate_vanilla_style<F: FileResolver>(style: &ast::Style, context: &mut DocumentContext<F>) {
    if let Some(style) = create_virt_style(style, context) {
        context
            .document
            .borrow_mut()
            .rules
            .push(virt::Rule::Style(style));
    }
}

fn create_virt_style<F: FileResolver>(
    style: &ast::Style,
    context: &mut DocumentContext<F>,
) -> Option<virt::StyleRule> {
    context
        .current_node
        .clone()
        .as_ref()
        .and_then(|node| {
            Some(get_style_namespace(
                node.get_name(),
                node.get_id(),
                &get_document_id(context.path),
                context.current_component,
            ))
        })
        .and_then(|ns| {
            Some(virt::StyleRule {
                id: "rule".to_string(),
                source_id: Some(style.id.to_string()),
                selector_text: format!(".{}", ns),
                style: create_style_declarations(style, context),
            })
        })
}

fn create_style_declarations<F: FileResolver>(
    style: &ast::Style,
    context: &DocumentContext<F>,
) -> Vec<virt::StyleDeclaration> {
    let mut decls = vec![];

    // insert extended styles _before_ the declarations in the body since
    // these declarations should be overwritten. Also note that we're
    // including the entire body of extended styles to to cover !important statements.
    // This could be smarter at some point.
    if let Some(extends) = &style.extends {
        for reference in extends {
            if let Some(reference) = context.graph.get_ref(&reference.path, context.path) {
                if let graph_ref::Expr::Style(style) = &reference.expr {
                    decls.extend(create_style_declarations(style, context));
                }
            }
        }
    }

    for decl in &style.declarations {
        decls.push(evaluate_style_declaration(&decl, context));
    }
    decls
}

fn evaluate_style_declaration<F: FileResolver>(
    decl: &css_ast::StyleDeclaration,
    context: &DocumentContext<F>,
) -> virt::StyleDeclaration {
    virt::StyleDeclaration {
        id: "dec".to_string(),
        source_id: decl.id.to_string(),
        name: decl.name.to_string(),
        value: stringify_style_decl_value(&decl.value, context),
    }
}

fn stringify_style_decl_value<F: FileResolver>(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext<F>,
) -> String {
    match decl {
        css_ast::DeclarationValue::SpacedList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(" "),
        css_ast::DeclarationValue::CommaList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(", "),
        css_ast::DeclarationValue::Arithmetic(expr) => {
            format!(
                "{} {} {}",
                stringify_style_decl_value(&expr.left, context),
                expr.operator,
                stringify_style_decl_value(&expr.right, context)
            )
        }
        css_ast::DeclarationValue::FunctionCall(expr) => {
            if expr.name == "var" && !expr.name.starts_with("--") {
                if let css_ast::DeclarationValue::Reference(reference) = &expr.arguments.as_ref() {
                    if let Some(reference) = context.graph.get_ref(&reference.path, context.path) {
                        if let graph_ref::Expr::Atom(atom) = reference.expr {
                            return format!("var(--{})", atom.id);
                        }
                    }
                }
            }

            // TODO - check for var
            format!(
                "{}({})",
                expr.name,
                match expr.name.as_str() {
                    "url" => stringify_url_arg_value(&expr.arguments, context),
                    _ => stringify_style_decl_value(&expr.arguments, context),
                }
            )
        }
        css_ast::DeclarationValue::HexColor(expr) => {
            format!("#{}", expr.value)
        }
        css_ast::DeclarationValue::Reference(expr) => expr.path.join("."),
        css_ast::DeclarationValue::Measurement(expr) => {
            format!("{}{}", expr.value, expr.unit)
        }
        css_ast::DeclarationValue::Number(expr) => {
            format!("{}", expr.value)
        }
        css_ast::DeclarationValue::String(expr) => {
            format!("\"{}\"", expr.value)
        }
    }
}

fn stringify_url_arg_value<F: FileResolver>(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext<F>,
) -> String {
    match decl {
        css_ast::DeclarationValue::String(expr) => {
            format!(
                "\"{}\"",
                context
                    .resolve_asset(&expr.value)
                    .unwrap_or(expr.value.to_string())
            )
        }
        _ => stringify_style_decl_value(decl, context),
    }
}
