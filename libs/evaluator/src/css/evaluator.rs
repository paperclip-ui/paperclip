use super::context::{CurrentNode, DocumentContext, PrioritizedRule};
use super::errors;
use super::virt;
use crate::core::utils::{get_style_namespace, get_variant_namespace};
use paperclip_common::fs::FileResolver;
use paperclip_common::get_or_short;
use paperclip_proto::ast::all::{Expression, ImmutableExpressionRef};
use paperclip_proto::ast::css as css_ast;
use paperclip_proto::ast::graph_ext as graph;
use paperclip_proto::ast::graph_ext::{self as graph_ref, Expr};
use paperclip_proto::ast::pc::override_body_item;
use paperclip_proto::ast::pc::{self as ast};
use paperclip_proto::virt::css::Rule;
use std::string::ToString;

#[derive(Debug, Clone)]
enum VariantTrigger {
    Boolean(bool),
    Selector(String),
}

type SelectorCombo = Vec<String>;

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

    evaluate_document(
        dependency.document.as_ref().expect("Document must exist"),
        &mut context,
    );

    Ok(virt::Document {
        id: dependency
            .document
            .as_ref()
            .expect("Document must exist")
            .id
            .to_string(),
        rules: collect_sorted_rules(&mut context),
    })
}

fn collect_sorted_rules<F: FileResolver>(context: &mut DocumentContext<F>) -> Vec<Rule> {
    let mut rules = context
        .rules
        .borrow_mut()
        .drain(0..)
        .collect::<Vec<PrioritizedRule>>();

    rules.sort_by(|a, b| a.partial_cmp(b).unwrap());

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
            let mut context = context.within_component(component);

            evaluate_node(
                render.node.as_ref().expect("Render node value must exist"),
                None,
                &mut context,
            );
        }
    }
}

fn evaluate_node<'a, F: FileResolver>(
    node: &'a ast::Node,
    parent: Option<ImmutableExpressionRef<'a>>,
    context: &mut DocumentContext<F>,
) {
    match node.get_inner() {
        ast::node::Inner::Style(style) => {
            evaluate_style(style, context);
        }
        ast::node::Inner::Element(expr) => {
            evaluate_element(expr, context);
        }
        ast::node::Inner::Insert(expr) => {
            evaluate_insert(expr, context);
        }
        ast::node::Inner::Slot(expr) => {
            evaluate_slot(expr, context);
        }
        ast::node::Inner::Text(expr) => {
            evaluate_text(expr, context);
        }
        ast::node::Inner::Override(expr) => {
            evaluate_override(expr, parent, context);
        }
    }
}

fn evaluate_element<F: FileResolver>(element: &ast::Element, context: &mut DocumentContext<F>) {
    let mut el_context = context.with_target_node(CurrentNode::Element(element));

    for item in &element.body {
        evaluate_node(item, Some(element.into()), &mut el_context)
    }
}

fn evaluate_insert<F: FileResolver>(insert: &ast::Insert, context: &mut DocumentContext<F>) {
    for item in &insert.body {
        evaluate_node(item, Some(insert.into()), context);
    }
}

fn evaluate_override<'a, F: FileResolver>(
    expr: &'a ast::Override,
    parent: Option<ImmutableExpressionRef<'a>>,
    context: &mut DocumentContext<F>,
) {
    let parent = if let Some(parent) = parent {
        parent.clone()
    } else {
        return;
    };

    for item in &expr.body {
        match item.get_inner() {
            override_body_item::Inner::Style(style) => evaluate_style(
                style,
                &mut into_shadow(
                    &expr.path,
                    parent.clone().try_into().expect("Must be an element"),
                    &mut context.clone(),
                )
                .with_ref_context(context),
            ),

            override_body_item::Inner::Variant(variant_override) => evaluate_variant_override(
                variant_override,
                &mut into_shadow(
                    &expr.path,
                    parent.clone().try_into().expect("Must be an element"),
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

    let mut shadow = context
        .within_instance(CurrentNode::Element(instance))
        .shadow(&instance_component_info);

    // looking for a.b. "a" is an instance
    // ignore single targets. E.g: just "a" since this is the target

    if path.len() > 0 {
        for i in 0..path.len() {
            let shadow_instance = context.graph.get_ref(
                &path[0..i + 1].to_vec(),
                &context.path,
                Some(instance_component_info.wrap().expr),
            );

            if let Some(info) = shadow_instance {
                shadow = match info.expr {
                    Expr::Element(element) => shadow.within_instance(CurrentNode::Element(element)),
                    Expr::Text(text) => shadow.within_instance(CurrentNode::TextNode(text)),
                    _ => shadow,
                };

                if let Expr::Element(element) = &info.expr {
                    if let Some(instance_component_info) = context
                        .graph
                        .get_instance_component_ref(element, &info.path)
                    {
                        shadow = shadow.shadow(&instance_component_info)
                    }
                }
            }
        }
    }

    shadow = shadow.with_priority(path.len() as u8);

    return shadow;
}

fn evaluate_slot<F: FileResolver>(slot: &ast::Slot, context: &mut DocumentContext<F>) {
    for item in &slot.body {
        evaluate_node(item, Some(slot.into()), context)
    }
}

fn evaluate_text<F: FileResolver>(expr: &ast::TextNode, context: &mut DocumentContext<F>) {
    let mut el_context = context.with_target_node(CurrentNode::TextNode(expr));

    for item in &expr.body {
        evaluate_node(item, Some(expr.into()), &mut el_context);
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
    } else if matches!(context.top().current_variant, None) {
        evaluate_vanilla_style(style, context)
    }
}

fn get_shadow_instance_selector<F: FileResolver>(context: &DocumentContext<F>) -> Vec<String> {
    let mut curr = context;

    let mut buffer: Vec<String> = vec![];

    while let Some(shadow_of) = &curr.shadow_of {
        if let Some(CurrentNode::Element(instance)) = shadow_of.target_node {
            buffer.insert(
                0,
                format!(
                    ".{}",
                    get_style_namespace(&instance.name, &instance.id, shadow_of.current_component)
                ),
            );

            if shadow_of.current_component.is_some() && !shadow_of.is_target_node_render_node() {
                buffer.insert(0, " ".to_string());
            }
        } else {
            println!("Instance not defined!")
        }
        curr = shadow_of.as_ref();
    }

    buffer
}

fn get_render_node_ns<F: FileResolver>(context: &DocumentContext<F>) -> Option<String> {
    let target_component = get_or_short!(context.current_component, None);

    let render_node = if let Some(render) = target_component.get_render_expr() {
        render.node.as_ref().expect("Node must exist")
    } else {
        return None;
    };

    return Some(get_style_namespace(
        match render_node.get_inner() {
            ast::node::Inner::Element(expr) => &expr.name,
            ast::node::Inner::Text(expr) => &expr.name,
            _ => &None,
        },
        render_node.get_id(),
        Some(target_component),
    ));
}

fn evaluate_variant_styles<F: FileResolver>(
    style: &ast::Style,
    variant_refs: &Vec<ast::Reference>,
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
    context: &mut DocumentContext<F>,
) {
    // The selector of the element currently in focus. Could be the render node.
    let target_node = get_or_short!(&context.target_node, {});

    // The component where the variant is defined
    let current_component = get_or_short!(context.current_component, {});

    // the render node of the current component
    let current_render_node = if let Some(render) = current_component.get_render_expr() {
        render.node.as_ref().expect("Node must exist")
    } else {
        return;
    };

    // The shadow selector which is defined if evaluating instances.
    let shadow_instance_selector_parts = get_shadow_instance_selector(context);

    let target_node_ns = get_style_namespace(
        target_node.get_name(),
        target_node.get_id(),
        // TODO - this may be different with varint overrides
        Some(current_component),
    );

    let top_context = context.top();
    let target_node_selector = format!(".{}", target_node_ns);
    let is_target_render_node = current_render_node.get_id() == target_node.get_id();
    let is_within_shadow = shadow_instance_selector_parts.len() > 0;

    let instance_selector = if let Some(instance) = top_context.current_instance {
        format!(
            ".{}",
            get_style_namespace(
                instance.get_name(),
                instance.get_id(),
                // TODO - this may be different with varint overrides
                top_context.current_component,
            )
        )
    } else {
        "".to_string()
    };

    let top_render_node_selector = if let Some(render_node_ns) = get_render_node_ns(top_context) {
        format!(".{}", render_node_ns)
    } else {
        instance_selector.clone()
    };
    let is_target_node_top_render_node = top_render_node_selector == target_node_selector;

    let shadow_instance_selector = if is_within_shadow {
        // if SPACE then top shadow instance is NOT render node, so leave as-is
        if shadow_instance_selector_parts
            .get(0)
            .expect("Value must exist")
            == &" ".to_string()
        {
            shadow_instance_selector_parts.join("")

        // if NO space then top shadow instance IS render node, which is already
        // top_render_node_selector.
        } else {
            shadow_instance_selector_parts[1..].join("")
        }
        // leave out TOP
    } else {
        "".to_string()
    };

    let is_shadow_instance_render_node =
        !shadow_instance_selector_parts.contains(&" ".to_string()) && is_within_shadow;

    let (pre_selector, post_selector) = if is_target_render_node {
        if is_shadow_instance_render_node {
            (
                if is_target_node_top_render_node {
                    format!("{}", target_node_selector)
                } else {
                    format!(
                        "{}{}{}",
                        top_render_node_selector, shadow_instance_selector, target_node_selector
                    )
                },
                "".to_string(),
            )
        } else {
            if is_target_node_top_render_node {
                (format!("{}", target_node_selector), "".to_string())
            } else {
                (
                    format!("{}", top_render_node_selector),
                    format!("{}{}", shadow_instance_selector, target_node_selector),
                )
            }
        }
    } else {
        if is_shadow_instance_render_node {
            (
                format!("{}{}", top_render_node_selector, shadow_instance_selector),
                format!(" {}", target_node_selector),
            )
        } else {
            (
                format!("{}", top_render_node_selector),
                format!("{} {}", shadow_instance_selector, target_node_selector),
            )
        }
    };

    // FOR DEBUGGING!
    // println!("shadow_instance_selector_parts: {:?}", shadow_instance_selector_parts);
    // println!("is_target_render_node: {}, is_shadow_instance_render_node: {}, is_target_node_top_render_node: {}", is_target_render_node, is_shadow_instance_render_node, is_target_node_top_render_node);
    // println!("top_render_node_selector:'{}', shadow_instance_selector:'{}', target_node_selector:'{}', instance_selector: '{}'", top_render_node_selector, shadow_instance_selector, target_node_selector, instance_selector);
    // println!("PRE:{}, POST:{}", pre_selector, post_selector);

    // println!("------------------------------");

    let evaluated_style = create_style_declarations(style, context);

    let mut assoc_variants = vec![];

    let variant_override = context.top().current_variant;

    let is_within_override = matches!(variant_override, Some(_));
    let mut found_overridable = false;

    for variant_ref in variant_refs {
        let assoc_variant = variant_ref
            .path
            .get(0)
            .and_then(|name| context.get_scoped_variant(name));

        if let Some((variant, _)) = assoc_variant {
            if let Some(curr_variant) = variant_override {
                found_overridable = found_overridable || (variant == curr_variant);
            }

            assoc_variants.push(variant);
        } else {
            // variant ref does not exist, so do not evaluate
            // TODO: need a more elegant way of handling this
            return;
        }
    }

    if is_within_override && !found_overridable {
        println!("Variant override not found");
        return;
    }

    // let is_inst_root = context.is_instance_root();

    if assoc_variants.len() > 0 {
        let variant_combo = assoc_variants
            .iter()
            .map(|v| format!(".{}", get_variant_namespace(v)))
            .collect::<Vec<_>>()
            .join("");

        let selector_text = format!("{}{}{}", pre_selector, variant_combo, post_selector);

        let virt_style = virt::rule::Inner::Style(virt::StyleRule {
            id: context.next_id(),
            source_id: Some(style.id.to_string()),
            selector_text,
            style: evaluated_style.clone(),
        })
        .get_outer();
        context.rules.borrow_mut().push(PrioritizedRule {
            priority: context.priority,
            rule: virt_style,
        });
    }

    let combos = get_combo_selectors2(expanded_combo_selectors);

    for (queries, group_selectors) in combos {
        let virt_style = if group_selectors.len() > 0 {
            virt::rule::Inner::Style(virt::StyleRule {
                id: context.next_id(),
                source_id: Some(style.id.to_string()),
                selector_text: format!(
                    "{}{}{}",
                    pre_selector,
                    group_selectors.join(""),
                    post_selector
                ),
                style: evaluated_style.clone(),
            })
            .get_outer()
        } else {
            virt::rule::Inner::Style(virt::StyleRule {
                id: context.next_id(),
                source_id: Some(style.id.to_string()),
                selector_text: format!("{}{}", pre_selector, post_selector),
                style: evaluated_style.clone(),
            })
            .get_outer()
        };

        if queries.len() == 0 {
            context.rules.borrow_mut().push(PrioritizedRule {
                priority: context.priority,
                rule: virt_style,
            });
        } else {
            let container_rule =
                queries
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
                            panic!("Unsupported container query: {}", container_query);
                        }
                    });

            context.rules.borrow_mut().push(PrioritizedRule {
                priority: context.priority,
                rule: container_rule,
            });
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

fn get_combo_selectors2(
    expanded_combo_selectors: &Vec<Vec<VariantTrigger>>,
) -> Vec<(SelectorCombo, SelectorCombo)> {
    let mut ret = vec![];

    // let mut combo_container_queries: SelectorCombos = vec![];
    // let mut combo_selectors: SelectorCombos = vec![];

    for combo_selectors in expanded_combo_selectors {
        let mut container_queries = vec![];
        let mut selectors = vec![];

        for selector in combo_selectors {
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

        ret.push((container_queries.clone(), selectors.clone()));
    }

    ret
}

// [[or, or, or] and [or]]

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
                let variant_triggers =
                    collect_triggers(&variant.triggers, &mut ctx.with_variant(variant));

                if combo_triggers.len() == 0 {
                    combo_triggers = variant_triggers;
                } else {
                    let mut new_combos = vec![];

                    for item in variant_triggers {
                        for item2 in &combo_triggers {
                            let mut new_combo = item2.clone();
                            new_combo.extend(item.clone());
                            new_combos.push(new_combo);
                        }
                    }
                    combo_triggers = new_combos;
                }
            }
        }
    }

    combo_triggers
}

/*

trigger e {
    ".selector" + ".another"
    ".blarg"
}

trigger b {
    e + ".blarg2"
    ".something-else"
}

trigger c {
    ".d"
}

trigger a {
    b + c
    ".eee"
}

[
    [".selector", ".another", ".blarg2"]
    [".blarg", ".blarg2"]
    [".something-else"]
]


[
    [".selector", ".another", ".blarg2", ".d"]
    [".blarg", ".blarg2", ".d"]
    [".something-else", ".d"]
    [".eee"]
]

*/

fn collect_triggers<F: FileResolver>(
    triggers: &Vec<ast::TriggerBodyItemCombo>,
    context: &DocumentContext<F>,
) -> Vec<Vec<VariantTrigger>> {
    let mut all_or_variants = vec![];

    for combo in triggers {
        let mut or_and_variants = vec![];
        let mut and_variants = vec![];

        for trigger in &combo.items {
            match trigger.get_inner() {
                ast::trigger_body_item::Inner::Bool(expr) => {
                    and_variants.push(VariantTrigger::Boolean(expr.value));
                }
                ast::trigger_body_item::Inner::Str(expr) => {
                    and_variants.push(VariantTrigger::Selector(expr.value.to_string()));
                }
                ast::trigger_body_item::Inner::Reference(_) => {
                    // skip until the end
                }
            }
        }

        or_and_variants.push(and_variants);

        for trigger in &combo.items {
            match trigger.get_inner() {
                ast::trigger_body_item::Inner::Reference(expr) => {
                    let ref_info = context
                        .graph
                        .get_ref(
                            &expr.path,
                            &context.path,
                            context
                                .current_component
                                .and_then(|component| Some(Expr::Component(component))),
                        )
                        .or_else(|| context.graph.get_ref(&expr.path, &context.path, None));

                    let nested = if let Some(info) = ref_info {
                        if let graph_ref::Expr::Trigger(trigger) = &info.expr {
                            collect_triggers(&trigger.body, context)
                        } else if let graph_ref::Expr::Variant(variant) = &info.expr {
                            // avoid recursion
                            if Some(variant) != context.current_variant.as_ref() {
                                collect_triggers(&variant.triggers, context)
                            } else {
                                vec![]
                            }
                        } else {
                            vec![]
                        }
                    } else {
                        vec![]
                    };

                    let mut new_combos = vec![];

                    for item in nested {
                        for item2 in &or_and_variants {
                            let mut new_combo = item2.clone();
                            new_combo.extend(item.clone());
                            new_combos.push(new_combo);
                        }
                    }

                    or_and_variants = new_combos;
                }
                _ => {}
            }
        }

        all_or_variants.extend(or_and_variants);
    }

    all_or_variants
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
    let mut scope_selector = get_shadow_instance_selector(context).join("");
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
        if let Some(reference) =
            context
                .graph
                .get_ref(&reference.path, &context.get_ref_context().path, None)
        {
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
