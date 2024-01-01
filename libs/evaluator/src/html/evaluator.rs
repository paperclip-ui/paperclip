pub use super::context::{DocumentContext, Options};
use super::virt;
use crate::core::utils::get_style_namespace;
use paperclip_common::fs::FileResolver;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::docco as docco_ast;
use paperclip_proto::ast::graph_ext::ComponentRefInfo;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::pc as ast;
use paperclip_proto::notice::base::Notice;
use paperclip_proto::notice::base::NoticeList;
use paperclip_proto::virt::html;
use std::collections::BTreeMap;
use std::collections::HashMap;

type InsertsMap<'expr> = HashMap<String, (String, Vec<virt::Node>)>;

pub async fn evaluate<F: FileResolver>(
    path: &str,
    graph: &Graph,
    file_resolver: &F,
    options: Options,
) -> Result<virt::Document, NoticeList> {
    let dependencies = &graph.dependencies;

    let dependency = dependencies
        .get(path)
        .expect("Dependency must exist (html evaluator)");
    let mut context = DocumentContext::new(path, graph, file_resolver, options);
    let document = evaluate_document(
        dependency.document.as_ref().expect("Document must exist"),
        &mut context,
    );
    if !context.notices.borrow().is_empty() {
        Err(NoticeList {
            items: context.notices.borrow().clone(),
        })
    } else {
        Ok(document)
    }
}

fn evaluate_document<F: FileResolver>(
    document: &ast::Document,
    context: &mut DocumentContext<F>,
) -> virt::Document {
    let mut children = vec![];
    for item in &document.body {
        let metadata = item
            .get_comment()
            .and_then(|comment| Some(evaluate_comment_metadata(&comment)));

        let visible = metadata
            .as_ref()
            .and_then(|metadata| metadata.get("frame"))
            .and_then(|bounds| {
                if let html::value::Inner::Obj(obj) = bounds.get_inner() {
                    Some(obj)
                } else {
                    None
                }
            })
            .and_then(|bounds| bounds.get("visible"))
            .and_then(|visible| {
                if let html::value::Inner::Bool(value) = visible.get_inner() {
                    Some(value.value)
                } else {
                    None
                }
            })
            .unwrap_or(true);

        if !visible {
            continue;
        }

        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                if context.options.include_components {
                    evaluate_component::<F>(
                        component,
                        &mut children,
                        &metadata,
                        &mut context.with_preview_data(get_preview_metadata(metadata.as_ref())),
                    );
                }
            }
            ast::document_body_item::Inner::Element(element) => {
                evaluate_element::<F>(
                    element,
                    &mut children,
                    &metadata,
                    &mut context.with_preview_data(get_preview_metadata(metadata.as_ref())),
                    false,
                    false,
                );
            }
            ast::document_body_item::Inner::Text(text_node) => {
                evaluate_text_node(
                    text_node,
                    &mut children,
                    &metadata,
                    &mut context.with_preview_data(get_preview_metadata(metadata.as_ref())),
                );
            }
            _ => {}
        }
    }

    virt::Document {
        id: get_virt_id(document.get_id(), &context.instance_ids, false),
        source_id: Some(document.id.to_string()),
        children,
    }
}

pub fn evaluate_property_value(expr: &docco_ast::PropertyValue) -> virt::Value {
    match expr.get_inner() {
        docco_ast::property_value::Inner::Parameters(params) => {
            let mut properties = vec![];
            for item in &params.items {
                properties.push(virt::ObjectProperty {
                    name: item.name.to_string(),
                    source_id: Some(item.id.to_string()),
                    value: Some(evaluate_property_value(
                        item.value.as_ref().expect("Value must exist"),
                    )),
                });
            }

            virt::value::Inner::Obj(virt::Obj {
                source_id: Some(params.id.clone()),
                properties,
            })
            .get_outer()
        }
        docco_ast::property_value::Inner::Str(value) => virt::value::Inner::Str(virt::Str {
            value: value.value.to_string(),
            source_id: Some(value.id.clone()),
        })
        .get_outer(),
        docco_ast::property_value::Inner::Num(value) => virt::value::Inner::Num(virt::Num {
            value: value.value,
            source_id: Some(value.id.clone()),
        })
        .get_outer(),
        docco_ast::property_value::Inner::Bool(value) => virt::value::Inner::Bool(virt::Bool {
            value: value.value,
            source_id: Some(value.id.clone()),
        })
        .get_outer(),
        docco_ast::property_value::Inner::List(list) => {
            let mut items = vec![];
            for item in &list.items {
                items.push(evaluate_property_value(&item));
            }

            virt::value::Inner::Ary(virt::Ary {
                source_id: Some(list.id.clone()),
                items,
            })
            .get_outer()
        }
    }
}

pub fn evaluate_comment_metadata(expr: &docco_ast::Comment) -> virt::Obj {
    let mut properties = vec![];

    for item in &expr.body {
        if let docco_ast::comment_body_item::Inner::Property(property) = item.get_inner() {
            properties.push(virt::ObjectProperty {
                name: property.name.clone(),
                source_id: Some(property.id.clone()),
                value: Some(evaluate_property_value(
                    property.value.as_ref().expect("Value must exist"),
                )),
            });
        }
    }

    virt::Obj {
        source_id: Some(expr.id.clone()),
        properties,
    }
}

fn evaluate_component<F: FileResolver>(
    component: &ast::Component,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
) {
    let render = if let Some(render) = component.get_render_expr() {
        render
    } else {
        return;
    };

    evaluate_render(
        &render,
        fragment,
        metadata,
        &mut context.within_component(component),
        true,
        false,
    );
}

fn evaluate_element<F: FileResolver>(
    element: &ast::Element,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
    is_instance: bool,
) {
    let reference = context
        .graph
        .get_instance_component_ref(element, &context.path);

    if let Some(component_info) = reference {
        evaluate_instance(
            element,
            &component_info,
            fragment,
            metadata,
            context,
            is_component_root,
        );
    } else {
        evaluate_native_element(
            element,
            fragment,
            metadata,
            context,
            is_component_root,
            is_instance,
        );
    }
}

fn evaluate_slot<F: FileResolver>(
    slot: &ast::Slot,
    fragment: &mut Vec<virt::Node>,
    context: &mut DocumentContext<F>,
) {
    if let Some(reference) = context.get_data(&slot.name) {
        let children: html::Ary = reference.into();

        for item in &children.items {
            match item.get_inner() {
                html::value::Inner::Node(node) => {
                    fragment.push(node.clone());
                }
                html::value::Inner::Num(node) => {
                    fragment.push(create_text_node(node.value.to_string().as_str(), context));
                }
                html::value::Inner::Str(node) => {
                    fragment.push(create_text_node(node.value.to_string().as_str(), context));
                }
                html::value::Inner::Bool(node) => {
                    fragment.push(create_text_node(node.value.to_string().as_str(), context));
                }
                html::value::Inner::Undef(_)
                | html::value::Inner::Ary(_)
                | html::value::Inner::Obj(_) => {}
            }
        }
        return;
    }

    // render default children
    for child in &slot.body {
        evaluate_node(child, fragment, &None, context, false, false);
    }
}

fn create_text_node<F: FileResolver>(value: &str, context: &DocumentContext<F>) -> virt::Node {
    virt::node::Inner::TextNode(virt::TextNode {
        id: get_virt_id(value, &context.instance_ids, false),
        source_id: Some(value.to_string()),
        metadata: None,
        value: value.to_string(),
        source_instance_ids: vec![],
    })
    .get_outer()
}

fn evaluate_instance<F: FileResolver>(
    element: &ast::Element,
    instance_of: &ComponentRefInfo,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
) {
    let render = if let Some(render) = instance_of.expr.get_render_expr() {
        render
    } else {
        return;
    };

    let mut data = create_instance_params(element, context, is_component_root);
    add_inserts_to_data(&mut create_inserts(element, context), &mut data);

    let mut scope = if is_component_root {
        context.render_scopes.clone()
    } else {
        vec![]
    };

    let instance_preview_data = get_preview_metadata(
        instance_of
            .expr
            .comment
            .as_ref()
            .and_then(|comment| Some(evaluate_comment_metadata(&comment)))
            .as_ref(),
    );

    scope.push(get_style_namespace(
        &element.name,
        &element.id,
        context.current_component,
    ));

    let preview_data = element
        .name
        .as_ref()
        .and_then(|name| context.preview_data.get(name.as_str()))
        .and_then(|value| {
            if let html::value::Inner::Obj(value) = &value.get_inner() {
                Some(value.clone())
            } else {
                None
            }
        })
        .unwrap_or(instance_preview_data);

    evaluate_render(
        &render,
        fragment,
        metadata,
        &mut context
            .with_data(data)
            .with_preview_data(preview_data)
            .within_instance(&element.id)
            .within_path(&instance_of.path)
            .within_component(&instance_of.expr)
            .set_render_scope(scope),
        true,
        true,
    );
}

fn add_inserts_to_data(inserts: &mut InsertsMap, data: &mut html::Obj) {
    for (name, (source_id, children)) in inserts.drain() {
        data.properties.push(html::ObjectProperty {
            source_id: Some(source_id.to_string()),
            name: name.to_string(),
            value: Some(
                html::value::Inner::Ary(html::Ary {
                    source_id: Some(source_id.to_string()),
                    items: children
                        .iter()
                        .map(|child| html::value::Inner::Node(child.clone()).get_outer())
                        .collect(),
                })
                .get_outer(),
            ),
        })
    }
}

fn get_preview_metadata(metadata: Option<&virt::Obj>) -> virt::Obj {
    metadata
        .and_then(|metadata| metadata.get("preview"))
        .and_then(|preview| {
            if let html::value::Inner::Obj(value) = &preview.get_inner() {
                Some(value.clone())
            } else {
                None
            }
        })
        .unwrap_or(virt::Obj {
            source_id: None,
            properties: vec![],
        })
}

fn create_inserts<'expr, F: FileResolver>(
    element: &'expr ast::Element,
    context: &mut DocumentContext<F>,
) -> InsertsMap<'expr> {
    let mut inserts = HashMap::new();
    for child in &element.body {
        evaluate_instance_child(element, child, &mut inserts, context);
    }
    inserts
}

macro_rules! get_insert {
    ($inserts: expr, $name: expr, $id: expr) => {
        if let Some(fragment) = $inserts.get_mut($name) {
            fragment
        } else {
            $inserts.insert($name.to_string(), ($id.to_string(), vec![]));
            $inserts.get_mut($name).unwrap()
        }
    };
}

fn evaluate_instance_child<'expr, F: FileResolver>(
    parent: &'expr ast::Element,
    child: &'expr ast::Node,
    inserts: &mut InsertsMap<'expr>,
    context: &mut DocumentContext<F>,
) {
    match child.get_inner() {
        ast::node::Inner::Insert(insert) => {
            // inserts that don't have children are no-op. I.e: `insert a {}` does nothing. It needs
            // children. This is a business rule that's reflected in editor where inserts are added by default
            // so that they can be filled with children
            if insert.body.len() == 0 {
                return;
            }

            let (_source_id, fragment) = get_insert!(inserts, &insert.name, &insert.id);

            for child in &insert.body {
                evaluate_node(child, fragment, &None, context, false, false);
            }
        }
        _ => {
            let mut fragment: Vec<virt::Node> = vec![];

            evaluate_node(child, &mut fragment, &None, context, false, false);

            if !fragment.is_empty() {
                get_insert!(inserts, "children", &parent.id)
                    .1
                    .extend(fragment)
            }
        }
    }
}

fn evaluate_render<F: FileResolver>(
    render: &ast::Render,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
    is_instance: bool,
) {
    evaluate_node(
        render.node.as_ref().expect("Node must exist"),
        fragment,
        metadata,
        context,
        is_component_root,
        is_instance,
    );
}

fn get_virt_id(expr_id: &str, instance_path: &Vec<String>, _is_instance: bool) -> String {
    if instance_path.len() == 0 {
        return expr_id.to_string();
    } else {
        format!("{}.{}", instance_path.join("."), expr_id)
    }
}

fn get_source_id(expr_id: &str, instance_path: &Vec<String>, is_instance: bool) -> String {
    if is_instance {
        instance_path.first().unwrap().clone()
    } else {
        expr_id.to_string()
    }
}

fn evaluate_native_element<F: FileResolver>(
    element: &ast::Element,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
    is_instance: bool,
) {
    let mut children = vec![];

    for child in &element.body {
        evaluate_node(child, &mut children, &None, context, false, false);
    }

    fragment.push(
        virt::node::Inner::Element(virt::Element {
            id: get_virt_id(element.get_id(), &context.instance_ids, is_instance),
            tag_name: element.tag_name.to_string(),
            source_id: Some(get_source_id(
                element.get_id(),
                &context.instance_ids,
                is_instance,
            )),
            source_instance_ids: context.instance_ids.clone(),
            attributes: create_native_attributes(element, context, is_instance, is_component_root),
            children,
            metadata: metadata.clone(),
        })
        .get_outer(),
    );
}

fn evaluate_node<F: FileResolver>(
    child: &ast::Node,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
    is_instance: bool,
) {
    match child.get_inner() {
        ast::node::Inner::Element(child) => evaluate_element(
            child,
            fragment,
            metadata,
            context,
            is_component_root,
            is_instance,
        ),
        ast::node::Inner::Slot(slot) => {
            evaluate_slot(&slot, fragment, context);
        }
        ast::node::Inner::Text(child) => evaluate_text_node(child, fragment, metadata, context),
        ast::node::Inner::Switch(child) => evaluate_switch(child, fragment, metadata, context),
        ast::node::Inner::Repeat(child) => evaluate_repeat(child, fragment, metadata, context),
        ast::node::Inner::Condition(child) => {
            evaluate_condition(child, fragment, metadata, context)
        }
        ast::node::Inner::Override(_)
        | ast::node::Inner::Style(_)
        | ast::node::Inner::Script(_)
        | ast::node::Inner::Insert(_) => {}
    }
}

fn create_native_attributes<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
    is_instance: bool,
    is_root: bool,
) -> Vec<virt::ObjectProperty> {
    let mut attributes = BTreeMap::new();

    for param in &element.parameters {
        evaluate_native_attribute(param, &mut attributes, context);
    }

    resolve_element_attributes(element, &mut attributes, context, is_instance, is_root);

    attributes.values().cloned().collect()
}

fn evaluate_native_attribute<F: FileResolver>(
    param: &ast::Parameter,
    attributes: &mut BTreeMap<String, virt::ObjectProperty>,
    context: &DocumentContext<F>,
) {
    attributes.insert(
        param.name.to_string(),
        virt::ObjectProperty {
            source_id: Some(param.id.to_string()),
            name: param.name.to_string(),
            value: Some(create_attribute_value(
                param.value.as_ref().expect("Value must exist"),
                context,
            )),
        },
    );
}

fn resolve_element_attributes<F: FileResolver>(
    element: &ast::Element,
    attributes: &mut BTreeMap<String, virt::ObjectProperty>,
    context: &DocumentContext<F>,
    is_instance: bool,
    is_root: bool,
) {
    // add styling hooks. If the element is root, then we need to add a special
    // ID so that child styles can be overridable
    if element.is_stylable() || is_instance || is_root {
        let mut class_name =
            get_style_namespace(&element.name, &element.id, context.current_component);

        if is_root || is_instance {
            if !context.render_scopes.is_empty() {
                class_name = format!("{} {}", class_name, context.render_scopes.join(" "));
            }
        } else if let Some(scope) = context.render_scopes.last() {
            class_name = format!("{} {}", class_name, scope);
        }

        if let Some(class) = attributes.get_mut("class") {
            if let Some(value) = &class.value {
                class.value = Some(format!("{} {}", class_name, value.to_string()).into())
            }
        } else {
            attributes.insert(
                "class".to_string(),
                virt::ObjectProperty {
                    source_id: None,
                    name: "class".to_string(),
                    value: Some(class_name.into()),
                },
            );
        }
    }

    // resolve assets
    if element.namespace == None {
        if element.tag_name.as_str() == "img" {
            if let Some(property) = attributes.get_mut("src") {
                if let Some(src) = &property.value {
                    let str_value = src.to_string();

                    if !str_value.starts_with("http://") && !str_value.starts_with("https://") {
                        let ret = context
                            .file_resolver
                            .resolve_file(&context.path, &str_value)
                            .map_err(|_| Notice::file_not_found(&context.path, &element.range));
                        if let Err(err) = ret {
                            context.add_notice(err);
                        } else {
                            property.value = Some(ret.unwrap().into());
                        }
                    }
                }
            }
        }
    }
}

fn create_instance_params<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
    _is_component_root: bool,
) -> html::Obj {
    let mut properties: BTreeMap<String, html::ObjectProperty> = BTreeMap::new();

    for param in &element.parameters {
        evaluate_instance_param(param, &mut properties, context);
    }

    // let mut class_name = get_style_namespace(&element.name, &element.id, context.current_component);

    // if let Some(class) = properties.get("class") {
    //     if let Some(value) = &class.value {
    //         class_name = format!("{} {}", class_name, value.to_string());
    //     }
    // }

    // properties.insert(
    //     "class".to_string(),
    //     html::ObjectProperty {
    //         source_id: None,
    //         name: "class".to_string(),
    //         value: Some(class_name.into()),
    //     },
    // );

    html::Obj {
        source_id: Some(element.id.to_string()),
        properties: properties.values().cloned().collect(),
    }
}

fn evaluate_instance_param<F: FileResolver>(
    param: &ast::Parameter,
    properties: &mut BTreeMap<String, html::ObjectProperty>,
    context: &DocumentContext<F>,
) {
    properties.insert(
        param.name.to_string(),
        html::ObjectProperty {
            source_id: Some(param.id.to_string()),
            name: param.name.to_string(),
            value: Some(create_attribute_value(
                param.value.as_ref().expect("Value must exist"),
                context,
            )),
        },
    );
}

fn create_attribute_value<F: FileResolver>(
    value: &ast::SimpleExpression,
    context: &DocumentContext<F>,
) -> html::Value {
    match value.get_inner() {
        ast::simple_expression::Inner::Str(value) => html::value::Inner::Str(html::Str {
            value: value.value.to_string(),
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Bool(value) => html::value::Inner::Bool(html::Bool {
            value: value.value,
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Num(value) => html::value::Inner::Num(html::Num {
            value: value.value,
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Reference(value) => {
            if let Some(value) = context.get_deep(&value.path) {
                return value.clone();
            }

            html::value::Inner::Undef(html::Undefined {
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Ary(value) => html::value::Inner::Ary(html::Ary {
            items: vec![],
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
    }
}

fn evaluate_switch<F: FileResolver>(
    expr: &ast::Switch,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
) {
    let value = context.get_data(&expr.property).and_then(|value| {
        if let html::value::Inner::Str(value) = &value.get_inner() {
            Some(&value.value)
        } else {
            None
        }
    });

    let case = if let Some(value) = value {
        expr.body.iter().find(|item| {
            if let ast::switch_item::Inner::Case(case) = &item.get_inner() {
                &case.condition == value
            } else {
                false
            }
        })
    } else {
        None
    };

    let case = case.or(expr
        .body
        .iter()
        .find(|item| matches!(item.get_inner(), ast::switch_item::Inner::Default(_))));

    if let Some(case) = case {
        match case.get_inner() {
            ast::switch_item::Inner::Case(case) => {
                for item in &case.body {
                    evaluate_node(item, fragment, metadata, context, false, false)
                }
            }
            ast::switch_item::Inner::Default(case) => {
                for item in &case.body {
                    evaluate_node(item, fragment, metadata, context, false, false)
                }
            }
        }
    }
}

fn evaluate_condition<F: FileResolver>(
    expr: &ast::Condition,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
) {
    let show = context
        .get_data(&expr.property)
        .and_then(|value| Some(value.is_truthy()))
        .unwrap_or(false);

    if show {
        for item in &expr.body {
            evaluate_node(item, fragment, metadata, context, false, false)
        }
    }
}
fn evaluate_repeat<F: FileResolver>(
    expr: &ast::Repeat,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
) {
    let list = context.get_data(&expr.property).and_then(|data| {
        if let html::value::Inner::Ary(value) = data.get_inner() {
            Some(value.clone())
        } else {
            None
        }
    });

    if let Some(list) = list {
        for item in &list.items {
            let preview_data = if let virt::value::Inner::Obj(value) = &item.get_inner() {
                value.clone()
            } else {
                virt::Obj::new_empty()
            };

            let mut sub_ctx = context.with_preview_data(preview_data.clone());

            for node in &expr.body {
                evaluate_node(node, fragment, metadata, &mut sub_ctx, false, false)
            }
        }
    }
}

fn evaluate_text_node<F: FileResolver>(
    text_node: &ast::TextNode,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::Obj>,
    context: &mut DocumentContext<F>,
) {
    let node = if text_node.is_stylable() {
        let class_name =
            get_style_namespace(&text_node.name, &text_node.id, context.current_component);

        virt::node::Inner::Element(virt::Element {
            id: format!(
                "outer-{}",
                get_virt_id(text_node.get_id(), &context.instance_ids, false)
            ),
            tag_name: "span".to_string(),
            source_id: Some(text_node.id.to_string()),
            source_instance_ids: context.instance_ids.clone(),
            attributes: vec![virt::ObjectProperty {
                source_id: None,
                name: "class".to_string(),
                value: Some(class_name.to_string().into()),
            }],
            metadata: metadata.clone(),
            children: vec![virt::node::Inner::TextNode(virt::TextNode {
                id: format!(
                    "{}",
                    get_virt_id(text_node.get_id(), &context.instance_ids, false)
                ),
                source_id: Some(text_node.id.to_string()),
                source_instance_ids: context.instance_ids.clone(),
                value: text_node.value.to_string(),
                metadata: None,
            })
            .get_outer()],
        })
        .get_outer()
    } else {
        virt::node::Inner::TextNode(virt::TextNode {
            id: format!(
                "{}",
                get_virt_id(text_node.get_id(), &context.instance_ids, false)
            ),
            source_id: Some(text_node.id.to_string()),
            source_instance_ids: context.instance_ids.clone(),
            value: text_node.value.to_string(),
            metadata: metadata.clone(),
        })
        .get_outer()
    };

    fragment.push(node);
}
