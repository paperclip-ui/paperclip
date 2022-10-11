use super::context::{CurrentNode, DocumentContext, PrioritizedRule};
use super::errors;
use super::virt;
use crate::core::utils::{get_style_namespace, get_variant_namespace};
use paperclip_common::fs::FileResolver;
use paperclip_common::get_or_short;
use paperclip_parser::css::ast as css_ast;
use paperclip_parser::graph;
use paperclip_parser::graph::reference::{self as graph_ref, Expr};
use paperclip_parser::pc::ast::{self, override_body_item};
use paperclip_proto::virt::css::Rule;
use std::string::ToString;

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

    Ok(virt::Document {
        id: dependency.document.id.to_string(),
        rules: collect_sorted_rules(&mut context),
    })
}

fn collect_sorted_rules<F: FileResolver>(context: &mut DocumentContext<F>) -> Vec<Rule> {
    let mut rules = context
        .rules
        .borrow_mut()
        .drain(0..)
        .collect::<Vec<PrioritizedRule>>();

    rules.sort_by(|a, b| b.partial_cmp(a).unwrap());

    rules.into_iter().map(|rule| rule.rule).collect()
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

    context.rules.borrow_mut().push(PrioritizedRule {
        priority: context.priority,
        rule: virt::rule::Inner::Style(virt::StyleRule {
            id,
            source_id: None,
            selector_text: ":root".to_string(),
            style: atoms
                .iter()
                .map(|atom| virt::StyleDeclaration {
                    id: atom.id.to_string(),
                    source_id: atom.id.to_string(),
                    name: atom.get_var_name(),
                    value: evaluate_atom(atom, context),
                })
                .collect(),
        })
        .get_outer(),
    })
}
fn evaluate_document_rules<F: FileResolver>(
    document: &ast::Document,
    context: &mut DocumentContext<F>,
) {
    // components first

    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                evaluate_component(component, context);
            }
            _ => {}
        }
    }

    for item in &document.body {
        // everything else
        match item.get_inner() {
            ast::document_body_item::Inner::Element(component) => {
                evaluate_element(component, context);
            }
            ast::document_body_item::Inner::Text(text) => {
                evaluate_text(text, context);
            }
            _ => {}
        }
    }
}

fn evaluate_component<F: FileResolver>(
    component: &ast::Component,
    context: &mut DocumentContext<F>,
) {
    for item in &component.body {
        if let ast::component_body_item::Inner::Render(render) = item.get_inner() {
            evaluate_render_node(
                render.node.as_ref().expect("Render node value must exist"),
                &mut context.within_component(component),
            );
        }
    }
}

fn evaluate_render_node<F: FileResolver>(node: &ast::RenderNode, context: &mut DocumentContext<F>) {
    match node.get_inner() {
        ast::render_node::Inner::Element(element) => {
            evaluate_element(element, context);
        }
        ast::render_node::Inner::Text(element) => {
            evaluate_text(element, context);
        }
        ast::render_node::Inner::Slot(expr) => {
            evaluate_slot(expr, context);
        }
    }
}

fn evaluate_element<F: FileResolver>(element: &ast::Element, context: &mut DocumentContext<F>) {
    let mut el_context = context.with_target_node(CurrentNode::Element(element));

    for item in &element.body {
        match item.get_inner() {
            ast::element_body_item::Inner::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
            ast::element_body_item::Inner::Element(expr) => {
                evaluate_element(expr, &mut el_context);
            }
            ast::element_body_item::Inner::Insert(expr) => {
                evaluate_insert(expr, &mut el_context);
            }
            ast::element_body_item::Inner::Slot(expr) => {
                evaluate_slot(expr, &mut el_context);
            }
            ast::element_body_item::Inner::Text(expr) => {
                evaluate_text(expr, &mut el_context);
            }
            ast::element_body_item::Inner::Override(expr) => {
                evaluate_override(expr, element, &mut el_context);
            }
        }
    }
}

fn evaluate_insert<F: FileResolver>(insert: &ast::Insert, context: &mut DocumentContext<F>) {
    for item in &insert.body {
        match item.get_inner() {
            ast::insert_body::Inner::Element(expr) => {
                evaluate_element(expr, context);
            }
            ast::insert_body::Inner::Text(expr) => {
                evaluate_text(expr, context);
            }
            ast::insert_body::Inner::Slot(expr) => {
                evaluate_slot(expr, context);
            }
        }
    }
}

fn evaluate_override<F: FileResolver>(
    expr: &ast::Override,
    parent: &ast::Element,
    context: &mut DocumentContext<F>,
) {
    for item in &expr.body {
        match item.get_inner() {
            override_body_item::Inner::Style(style) => evaluate_style(
                style,
                &mut into_shadow(&expr.path, parent, &mut context.clone()).with_ref_context(context),
            ),
            override_body_item::Inner::Variant(variant_override) => evaluate_variant_override(
                variant_override,
                &mut into_shadow(
                    &expr.path,
                    parent,
                    &mut context.with_variant(variant_override),
                ),
            ),
        }
    }
}

fn into_shadow<'a, F: FileResolver>(
    path: &Vec<String>,
    instance: &'a ast::Element,
    context: &'a mut DocumentContext<F>,
) -> DocumentContext<'a, 'a, F> {
    let instance_component_info = get_or_short!(
        context
            .graph
            .get_instance_component_ref(instance, &context.path),
        context.clone()
    );
    

    let mut curr_instance = instance;
    let instance_context = context.within_instance(curr_instance);


    let mut shadow = instance_context.shadow(&instance_component_info);

    // looking for a.b. "a" is an instance
    // ignore single targets. E.g: just "a" since this is the target
    if path.len() > 1 {
        for i in 0..path.len() {
            let shadow_instance = context.graph.get_ref(
                &path[0..i + 1].to_vec(),
                &context.path,
                Some(instance_component_info.wrap().expr)
            );


            if let Some(info) = shadow_instance {
                if let Expr::Element(element) = &info.expr {
                    if let Some(instance_component_info) = context
                        .graph
                        .get_instance_component_ref(element, &info.path)
                    {
                        shadow = shadow
                            .within_instance(element)
                            .shadow(&instance_component_info)
                            // .with_target_node(node)
                    }
                }
            }
        }
    }

    // target node at the end of the path
    let target_node = get_or_short!(
        if path.len() > 0 {
            shadow
                .graph
                .get_ref(
                    path,
                    instance_component_info.path,
                    Some(instance_component_info.wrap().expr)
                )
                .and_then(|node| {
                    match node.expr {
                        Expr::Element(element) => Some(CurrentNode::Element(element)),
                        _ => None,
                    }
                })
        } else {
            Some(CurrentNode::Element(instance))
        },
        context.clone()
    );


    shadow = shadow
        .with_target_node(target_node)
        .with_priority(path.len() as u8);

    return shadow;
}

fn evaluate_slot<F: FileResolver>(slot: &ast::Slot, context: &mut DocumentContext<F>) {
    for item in &slot.body {
        match item.get_inner() {
            ast::slot_body_item::Inner::Element(expr) => {
                evaluate_element(expr, context);
            }
            ast::slot_body_item::Inner::Text(expr) => {
                evaluate_text(expr, context);
            }
        }
    }
}

fn evaluate_text<F: FileResolver>(expr: &ast::TextNode, context: &mut DocumentContext<F>) {
    let mut el_context = context.with_target_node(CurrentNode::TextNode(expr));

    for item in &expr.body {
        match item.get_inner() {
            ast::text_node_body_item::Inner::Style(style) => {
                evaluate_style(style, &mut el_context);
            }
        }
    }
}
fn evaluate_variant_override<F: FileResolver>(
    _variant_override: &ast::Variant,
    context: &mut DocumentContext<F>,
) {
    evaluate_component(
        context.current_component.expect("Component must be set"),
        context,
    )
}

fn evaluate_style<F: FileResolver>(style: &ast::Style, context: &mut DocumentContext<F>) {
    if style.variant_combo.len() > 0 {
        let expanded_combo_selectors =
            collect_style_variant_selectors(&style.variant_combo, context);

        evaluate_variant_styles(
            &style,
            &style.variant_combo,
            &expanded_combo_selectors,
            context,
        );
    } else {
        evaluate_vanilla_style(style, context)
    }
}

fn get_current_instance_scope_selector<F: FileResolver>(context: &DocumentContext<F>) -> String {
    // let is_root_node = context.is_target_node_root();

    let mut curr = context;

    let mut buffer: Vec<String> = vec![];

    while let Some(shadow_of) = &curr.shadow_of {
        curr = shadow_of.as_ref();
        if let Some(instance) = shadow_of.current_instance {
            buffer.push(format!(
                "{}.{}",
                if shadow_of.is_target_node_render_node() {
                    ""
                } else {
                    " "
                },
                get_style_namespace(&instance.name, &instance.id, shadow_of.current_component)
            ));
        } else {
            println!("Instance not defined!")
        }
    }
    buffer.reverse();
    

    buffer.join("")
}

fn evaluate_variant_styles<F: FileResolver>(
    style: &ast::Style,
    variant_refs: &Vec<ast::Reference>,
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
    context: &mut DocumentContext<F>,
) {
    let current_node = if let Some(node) = &context.target_node {
        node
    } else {
        return;
    };

    let target_component = get_or_short!(context.current_component, {});

    let root_node = if let Some(render) = target_component.get_render_expr() {
        render.node.as_ref().expect("Node must exist")
    } else {
        return;
    };


    let mut scope_selector = get_current_instance_scope_selector(context);
    let is_root_node = root_node.get_id() == current_node.get_id();

    // if !context.is_target_node_render_node() {
    //     scope_selector = format!("{}!!!!!", scope_selector);
    // }

    let node_ns = get_style_namespace(
        current_node.get_name(),
        current_node.get_id(),
        // TODO - this may be different with varint overrides
        Some(target_component),
    );

    let root_node_ns = get_style_namespace(
        match root_node.get_inner() {
            ast::render_node::Inner::Element(expr) => &expr.name,
            ast::render_node::Inner::Text(expr) => &expr.name,
            _ => &None,
        },
        &root_node.get_id(),
        Some(target_component),
    );

    let evaluated_style = create_style_declarations(style, context);

    let mut assoc_variants = vec![];
    for variant_ref in variant_refs {
        let assoc_variant = variant_ref
            .path
            .get(0)
            .and_then(|name| context.get_scoped_variant(name));

        if let Some(variant) = assoc_variant {
            assoc_variants.push(variant);
        }
    }

    for (assoc_variant, _variant_context) in assoc_variants {
        let virt_style = virt::rule::Inner::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text: format!(
                "{}.{}.{}{}",
                scope_selector,
                root_node_ns,
                get_variant_namespace(assoc_variant),
                if is_root_node {
                    "".to_string()
                } else {
                    format!(" .{}", node_ns)
                }
            ),
            style: evaluated_style.clone(),
        })
        .get_outer();
        context.rules.borrow_mut().push(PrioritizedRule {
            priority: context.priority,
            rule: virt_style,
        });
    }

    let (combo_queries, combo_selectors) = get_combo_selectors(expanded_combo_selectors);

    let virt_styles = if combo_selectors.len() > 0 {
        combo_selectors
            .iter()
            .map(|group_selectors| {
                virt::rule::Inner::Style(virt::StyleRule {
                    id: context.next_id(),
                    source_id: Some(style.id.to_string()),
                    selector_text: format!(
                        "{}.{}{}{}",
                        scope_selector,
                        root_node_ns,
                        group_selectors.join(""),
                        if is_root_node {
                            "".to_string()
                        } else {
                            format!(" .{}", node_ns)
                        }
                    ),
                    style: evaluated_style.clone(),
                })
                .get_outer()
            })
            .collect::<Vec<virt::Rule>>()
    } else if combo_queries.len() > 0 {
        vec![virt::rule::Inner::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text: format!(
                "{}.{}{}",
                scope_selector,
                root_node_ns,
                if is_root_node {
                    "".to_string()
                } else {
                    format!(" .{}", node_ns)
                }
            ),
            style: evaluated_style.clone(),
        })
        .get_outer()]
    } else {
        return;
    };

    for virt_style in virt_styles {
        if combo_queries.len() == 0 {
            context.rules.borrow_mut().push(PrioritizedRule {
                priority: context.priority,
                rule: virt_style,
            });
        } else {
            for container_queries in &combo_queries {
                let container_rule =
                    container_queries
                        .iter()
                        .fold(virt_style.clone(), |rule, container_query| {
                            if container_query.starts_with("@media") {
                                virt::rule::Inner::Media(create_condition_rule(
                                    "media",
                                    container_query,
                                    vec![rule],
                                    context,
                                ))
                                .get_outer()
                            } else if container_query.starts_with("@supports") {
                                virt::rule::Inner::Supports(create_condition_rule(
                                    "supports",
                                    container_query,
                                    vec![rule],
                                    context,
                                ))
                                .get_outer()
                            } else {
                                rule
                            }
                        });

                context.rules.borrow_mut().push(PrioritizedRule {
                    priority: context.priority,
                    rule: container_rule,
                });
            }
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
                    container_queries.push(selector.to_string());
                } else {
                    selectors.push(selector.to_string());
                }
            } else if let VariantTrigger::Boolean(_value) = selector {
                // trick to enable selector
                selectors.push("".to_string());
            }
        }

        combo_container_queries = merge_combos(&combo_container_queries, &container_queries);
        combo_selectors = merge_combos(&combo_selectors, &selectors);
    }

    (combo_container_queries, combo_selectors)
}

fn merge_combos(existing_combos: &SelectorCombos, new_items: &Vec<String>) -> SelectorCombos {
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
    for variant_ref in variant_refs {
        if variant_ref.path.len() == 1 {
            let variant = context.get_scoped_variant(variant_ref.path.get(0).unwrap());

            if let Some((variant, ctx)) = variant {
                let mut triggers = vec![];
                collect_triggers(&variant.triggers, &mut triggers, &mut ctx.with_variant(variant));
                combo_triggers.push(triggers);
            }
        }
    }

    combo_triggers
}

fn collect_triggers<F: FileResolver>(
    triggers: &Vec<ast::TriggerBodyItem>,
    into: &mut Vec<VariantTrigger>,
    context: &DocumentContext<F>,
) {
    for trigger in triggers {
        match trigger.get_inner() {
            ast::trigger_body_item::Inner::Boolean(expr) => {
                into.push(VariantTrigger::Boolean(expr.value));
            }
            ast::trigger_body_item::Inner::Str(expr) => {
                into.push(VariantTrigger::Selector(expr.value.to_string()));
            }
            ast::trigger_body_item::Inner::Reference(expr) => {
                let ref_info = context.graph.get_ref(&expr.path, &context.path, context.current_component.and_then(|component| {
                    Some(Expr::Component(component))
                })).or_else(|| {
                    context.graph.get_ref(&expr.path, &context.path, None)
                });

                if let Some(info) = ref_info {
                    if let graph_ref::Expr::Trigger(trigger) = &info.expr {
                        collect_triggers(&trigger.body, into, context);
                    } else if let graph_ref::Expr::Variant(variant) = &info.expr {

                        // avoid recursion
                        if Some(variant) != context.current_variant.as_ref() {
                            collect_triggers(&variant.triggers, into, context);
                        } else {
                            println!("Recursive variants are not allowed!");
                        }
                    }
                }
            }
        }
    }
}

fn evaluate_atom<F: FileResolver>(atom: &ast::Atom, context: &DocumentContext<F>) -> String {
    stringify_style_decl_value(atom.value.as_ref().expect("Value must exist"), context)
}

fn evaluate_vanilla_style<F: FileResolver>(style: &ast::Style, context: &mut DocumentContext<F>) {
    if let Some(style) = create_virt_style(style, context) {
        context.rules.borrow_mut().push(PrioritizedRule {
            priority: context.priority,
            rule: virt::rule::Inner::Style(style).get_outer(),
        });
    }
}

fn create_virt_style<F: FileResolver>(
    style: &ast::Style,
    context: &mut DocumentContext<F>,
) -> Option<virt::StyleRule> {
    let mut scope_selector = get_current_instance_scope_selector(context);
    if !context.is_target_node_render_node() {
        scope_selector = format!("{} ", scope_selector);
    }

    context
        .target_node
        .clone()
        .as_ref()
        .and_then(|node| {
            Some(get_style_namespace(
                node.get_name(),
                node.get_id(),
                context.current_component,
            ))
        })
        .and_then(|ns| {
            Some(virt::StyleRule {
                id: "rule".to_string(),
                source_id: Some(style.id.to_string()),
                selector_text: format!("{}.{}", scope_selector, ns),
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
    for reference in &style.extends {
        if let Some(reference) = context.graph.get_ref(&reference.path, &context.get_ref_context().path, None) {
            if let graph_ref::Expr::Style(style) = &reference.expr {
                decls.extend(create_style_declarations(
                    style,
                    &mut context.within_path(&reference.path),
                ));
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
        value: stringify_style_decl_value(&decl.value.as_ref().expect("value missing"), context),
    }
}

fn stringify_style_decl_value<F: FileResolver>(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext<F>,
) -> String {
    match &decl.get_inner() {
        css_ast::declaration_value::Inner::SpacedList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(" "),
        css_ast::declaration_value::Inner::CommaList(expr) => expr
            .items
            .iter()
            .map(|item| stringify_style_decl_value(item, context))
            .collect::<Vec<String>>()
            .join(", "),
        css_ast::declaration_value::Inner::Arithmetic(expr) => {
            format!(
                "{} {} {}",
                stringify_style_decl_value(&expr.left.as_ref().expect("Left missing"), context),
                expr.operator,
                stringify_style_decl_value(&expr.right.as_ref().expect("Right missing"), context)
            )
        }
        css_ast::declaration_value::Inner::FunctionCall(expr) => {
            if expr.name == "var" && !expr.name.starts_with("--") {
                if let Some(atom) = context.graph.get_var_ref(expr, &context.path) {
                    return format!("var({})", atom.get_var_name());
                }
            }

            // TODO - check for var
            format!(
                "{}({})",
                expr.name,
                match expr.name.as_str() {
                    "url" => stringify_url_arg_value(
                        &expr.arguments.as_ref().expect("arguments missing"),
                        context
                    ),
                    _ => stringify_style_decl_value(
                        &expr.arguments.as_ref().expect("arguments missing"),
                        context
                    ),
                }
            )
        }
        css_ast::declaration_value::Inner::HexColor(expr) => {
            format!("#{}", expr.value)
        }
        css_ast::declaration_value::Inner::Reference(expr) => expr.path.join("."),
        css_ast::declaration_value::Inner::Measurement(expr) => {
            format!("{}{}", expr.value, expr.unit)
        }
        css_ast::declaration_value::Inner::Number(expr) => {
            format!("{}", expr.value)
        }
        css_ast::declaration_value::Inner::Str(expr) => {
            format!("\"{}\"", expr.value)
        }
    }
}

fn stringify_url_arg_value<F: FileResolver>(
    decl: &css_ast::DeclarationValue,
    context: &DocumentContext<F>,
) -> String {
    match &decl.get_inner() {
        css_ast::declaration_value::Inner::Str(expr) => {
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
