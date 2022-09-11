use super::context::DocumentContext;
use super::errors;
use super::utils::get_style_namespace;
use super::virt;
use crate::base::types::AssetResolver;
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
pub async fn evaluate<'asset_resolver>(
    path: &str,
    graph: &graph::Graph,
    resolve_asset: Rc<Box<AssetResolver>>,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    let dependency = if let Some(dependency) = dependencies.get(path) {
        dependency
    } else {
        return Err(errors::RuntimeError {
            message: "not found".to_string(),
        });
    };

    let mut context = DocumentContext::new(path, graph, resolve_asset);

    evaluate_document(&dependency.document, &mut context);

    Ok(Rc::try_unwrap(context.document).unwrap().into_inner())
}

fn evaluate_document(document: &ast::Document, context: &mut DocumentContext) {
    evaluate_tokens(document, context);
    evaluate_document_rules(document, context);
}

fn evaluate_tokens(document: &ast::Document, context: &mut DocumentContext) {
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
fn evaluate_document_rules(document: &ast::Document, context: &mut DocumentContext) {
    for item in &document.body {
        evaluate_body_rule(item, context);
    }
}

fn evaluate_body_rule(item: &ast::DocumentBodyItem, context: &mut DocumentContext) {
    match item {
        ast::DocumentBodyItem::Component(component) => {
            evaluate_component(component, context);
        }
        ast::DocumentBodyItem::Element(component) => {
            evaluate_element(component, context);
        }
        _ => {}
    }
}

fn evaluate_component(component: &ast::Component, context: &mut DocumentContext) {
    for item in &component.body {
        if let ast::ComponentBodyItem::Render(render) = item {
            evaluate_render_node(&render.node, &mut context.within_component(component));
        }
    }
}

fn evaluate_render_node(node: &ast::RenderNode, context: &mut DocumentContext) {
    match node {
        ast::RenderNode::Element(element) => {
            evaluate_element(element, context);
        }
        _ => {}
    }
}

fn evaluate_element(element: &ast::Element, context: &mut DocumentContext) {
    let mut el_context = context.within_element(element);

    for item in &element.body {
        match item {
            ast::ElementBodyItem::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
            _ => {}
        }
    }
}

fn evaluate_style(style: &ast::Style, context: &mut DocumentContext) {
    if let Some(variants) = &style.variant_combo {
        let expanded_combo_selectors = collect_style_variant_selectors(variants, context);
        evaluate_variant_styles(&style, variants, &expanded_combo_selectors, context);
    } else {
        evaluate_vanilla_style(style, context)
    }
}

fn evaluate_variant_styles(
    style: &ast::Style,
    variants: &Vec<ast::Reference>,
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
    context: &mut DocumentContext,
) {
    let current_component = if let Some(component) = context.current_component {
        component
    } else {
        return;
    };

    let ns = if let Some(ns) = context.current_element.and_then(|element| {
        Some(get_style_namespace(
            element,
            &context.document.borrow().id,
            context.current_component,
        ))
    }) {
        ns
    } else {
        return;
    };

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
            selector_text: format!(".{} .{}", assoc_variant.id, ns),
            style: evaluated_style.clone(),
        });
        context.document.borrow_mut().rules.push(virt_style);
    }

    // first up,

    let (combo_queries, combo_selectors) = get_combo_selectors(expanded_combo_selectors);

    for group_selectors in combo_selectors {
        let virt_style = virt::Rule::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text: format!(
                ".{}{} .{}",
                current_component.id,
                group_selectors.join(""),
                ns
            ),
            style: evaluated_style.clone(),
        });

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

fn create_condition_rule(
    name: &str,
    container_query: &str,
    rules: Vec<virt::Rule>,
    context: &mut DocumentContext,
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

fn collect_style_variant_selectors(
    variant_refs: &Vec<ast::Reference>,
    context: &mut DocumentContext,
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

fn collect_triggers(
    triggers: &Vec<ast::TriggerBodyItem>,
    into: &mut Vec<VariantTrigger>,
    context: &mut DocumentContext,
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

fn evaluate_atom(atom: &ast::Atom, context: &DocumentContext) -> String {
    stringify_style_decl_value(&atom.value, context)
}

fn evaluate_vanilla_style(style: &ast::Style, context: &mut DocumentContext) {
    if let Some(style) = create_virt_style(style, context) {
        context
            .document
            .borrow_mut()
            .rules
            .push(virt::Rule::Style(style));
    }
}

fn create_virt_style(style: &ast::Style, context: &mut DocumentContext) -> Option<virt::StyleRule> {
    context
        .current_element
        .and_then(|element| {
            Some(get_style_namespace(
                element,
                &context.document.borrow().id,
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

fn create_style_declarations(
    style: &ast::Style,
    context: &DocumentContext,
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

fn evaluate_style_declaration(
    decl: &css_ast::StyleDeclaration,
    context: &DocumentContext,
) -> virt::StyleDeclaration {
    virt::StyleDeclaration {
        id: "dec".to_string(),
        source_id: decl.id.to_string(),
        name: decl.name.to_string(),
        value: stringify_style_decl_value(&decl.value, context),
    }
}

fn stringify_style_decl_value(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext,
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
                stringify_style_decl_value(&expr.arguments, context)
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
