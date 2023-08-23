pub use super::context::{DocumentContext, Options};
use super::virt;
use crate::core::errors;
use crate::core::utils::get_style_namespace;
use crate::core::virt as core_virt;
use paperclip_common::fs::FileResolver;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::docco as docco_ast;
use paperclip_proto::ast::graph_ext::ComponentRefInfo;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::pc as ast;
use paperclip_proto::virt::html::Bounds;
use std::collections::BTreeMap;
use std::collections::HashMap;

type InsertsMap<'expr> = HashMap<String, (String, Vec<virt::Node>)>;

pub async fn evaluate<F: FileResolver>(
    path: &str,
    graph: &Graph,
    file_resolver: &F,
    options: Options,
) -> Result<virt::Document, errors::RuntimeError> {
    let dependencies = &graph.dependencies;

    if let Some(dependency) = dependencies.get(path) {
        let mut context = DocumentContext::new(path, graph, file_resolver, options);
        let document = evaluate_document(
            dependency.document.as_ref().expect("Document must exist"),
            &mut context,
        );
        Ok(document)
    } else {
        Err(errors::RuntimeError {
            message: "not found".to_string(),
        })
    }
}

fn evaluate_document<F: FileResolver>(
    document: &ast::Document,
    context: &mut DocumentContext<F>,
) -> virt::Document {
    let mut children = vec![];
    let mut metadata: Option<virt::NodeMedata> = None;

    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                if context.options.include_components {
                    evaluate_component::<F>(component, &mut children, &metadata, context);
                }
                metadata = None;
            }
            ast::document_body_item::Inner::Element(element) => {
                evaluate_element::<F>(element, &mut children, &metadata, context, false, false);
                metadata = None;
            }
            ast::document_body_item::Inner::DocComment(doc_comment) => {
                metadata = Some(evaluate_comment_metadata(doc_comment));
            }
            ast::document_body_item::Inner::Text(text_node) => {
                evaluate_text_node(text_node, &mut children, &metadata, context);
                metadata = None;
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

pub fn evaluate_comment_metadata(expr: &docco_ast::Comment) -> virt::NodeMedata {
    let mut bounds = None;

    // lazy af code. Clean me
    for item in &expr.body {
        match item.get_inner() {
            docco_ast::comment_body_item::Inner::Property(property) => {
                match property.name.as_str() {
                    "bounds" => {
                        match property
                            .value
                            .as_ref()
                            .expect("Value must exist")
                            .get_inner()
                        {
                            docco_ast::property_value::Inner::Parameters(parameters) => {
                                let mut bounds2 = Bounds::default();

                                for item in &parameters.items {
                                    let value =
                                        item.value.as_ref().expect("Value must exist").get_inner();
                                    let num_value = match value {
                                        docco_ast::parameter_value::Inner::Num(number) => {
                                            Some(number.value)
                                        }
                                        _ => None,
                                    };

                                    match item.name.as_str() {
                                        "width" => {
                                            if let Some(value) = num_value {
                                                bounds2.width = value;
                                            }
                                        }
                                        "height" => {
                                            if let Some(value) = num_value {
                                                bounds2.height = value;
                                            }
                                        }
                                        "x" => {
                                            if let Some(value) = num_value {
                                                bounds2.x = value;
                                            }
                                        }
                                        "y" => {
                                            if let Some(value) = num_value {
                                                bounds2.y = value;
                                            }
                                        }
                                        _ => {}
                                    }
                                }

                                bounds = Some(bounds2);
                            }
                            _ => {}
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }

    virt::NodeMedata {
        bounds,
        visible: Some(true),
    }
}

fn evaluate_component<F: FileResolver>(
    component: &ast::Component,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::NodeMedata>,
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
    metadata: &Option<virt::NodeMedata>,
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
    if let Some(data) = &context.data {
        if let Some(reference) = data.get(&slot.name) {
            if let core_virt::value::Inner::Ary(children) = reference.get_inner() {
                for item in &children.items {
                    match item.get_inner() {
                        core_virt::value::Inner::Node(node) => {
                            fragment.push(node.clone());
                        }
                        _ => {}
                    }
                }
            }
            return;
        }
    }

    // render default children
    for child in &slot.body {
        evaluate_node(child, fragment, &None, context, false, false);
    }
}

fn evaluate_instance<F: FileResolver>(
    element: &ast::Element,
    instance_of: &ComponentRefInfo,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::NodeMedata>,
    context: &mut DocumentContext<F>,
    is_component_root: bool,
) {
    let render = if let Some(render) = instance_of.expr.get_render_expr() {
        render
    } else {
        return;
    };

    let mut data = create_instance_params(element, context);
    add_inserts_to_data(&mut create_inserts(element, context), &mut data);

    let mut scope = context.render_scopes.clone();
    scope.push(get_style_namespace(
        &element.name,
        &element.id,
        context.current_component,
    ));

    evaluate_render(
        &render,
        fragment,
        metadata,
        &mut context
            .with_data(data)
            .within_instance(&element.id)
            .within_path(&instance_of.path)
            .within_component(&instance_of.expr)
            .set_render_scope(scope),
        is_component_root,
        true,
    );
}

fn add_inserts_to_data(inserts: &mut InsertsMap, data: &mut core_virt::Obj) {
    for (name, (source_id, children)) in inserts.drain() {
        data.properties.push(core_virt::ObjectProperty {
            source_id: Some(source_id.to_string()),
            name: name.to_string(),
            value: Some(
                core_virt::value::Inner::Ary(core_virt::Ary {
                    source_id: Some(source_id.to_string()),
                    items: children
                        .iter()
                        .map(|child| core_virt::value::Inner::Node(child.clone()).get_outer())
                        .collect(),
                })
                .get_outer(),
            ),
        })
    }
}

fn create_inserts<'expr, F: FileResolver>(
    element: &'expr ast::Element,
    context: &mut DocumentContext<F>,
) -> InsertsMap<'expr> {
    let mut inserts = HashMap::new();
    for child in &element.body {
        evaluate_instance_child(element, child, &mut inserts, &None, context);
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
    metadata: &Option<virt::NodeMedata>,
    context: &mut DocumentContext<F>,
) {
    match child.get_inner() {
        ast::node::Inner::Insert(insert) => {
            let (_source_id, fragment) = get_insert!(inserts, &insert.name, &insert.id);

            for child in &insert.body {
                evaluate_node(child, fragment, metadata, context, false, false);
            }
        }
        _ => {
            let mut fragment: Vec<virt::Node> = vec![];

            evaluate_node(child, &mut fragment, metadata, context, false, false);

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
    metadata: &Option<virt::NodeMedata>,
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
    metadata: &Option<virt::NodeMedata>,
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
            attributes: create_native_attributes(
                element,
                context,
                is_instance || is_component_root,
            ),
            children,
            metadata: metadata.clone(),
        })
        .get_outer(),
    );
}

fn evaluate_node<F: FileResolver>(
    child: &ast::Node,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::NodeMedata>,
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
        _ => {}
    }
}

fn create_native_attributes<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
    is_instance_or_root: bool,
) -> Vec<virt::Attribute> {
    let mut attributes = BTreeMap::new();

    for param in &element.parameters {
        evaluate_native_attribute(param, &mut attributes, context);
    }

    resolve_element_attributes(element, &mut attributes, context, is_instance_or_root);

    attributes.values().cloned().collect()
}

fn evaluate_native_attribute<F: FileResolver>(
    param: &ast::Parameter,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext<F>,
) {
    attributes.insert(
        param.name.to_string(),
        virt::Attribute {
            source_id: Some(param.id.to_string()),
            name: param.name.to_string(),
            value: create_attribute_value(param.value.as_ref().expect("Value must exist"), context)
                .to_string(),
        },
    );
}

fn resolve_element_attributes<F: FileResolver>(
    element: &ast::Element,
    attributes: &mut BTreeMap<String, virt::Attribute>,
    context: &DocumentContext<F>,
    is_instance_or_root: bool,
) {
    // add styling hooks. If the element is root, then we need to add a special
    // ID so that child styles can be overridable
    if element.is_stylable() || is_instance_or_root {
        let mut class_name =
            get_style_namespace(&element.name, &element.id, context.current_component);
        if is_instance_or_root && !context.render_scopes.is_empty() {
            class_name = format!("{} {}", class_name, context.render_scopes.join(" "));
        }

        if let Some(class) = attributes.get_mut("class") {
            class.value = format!("{} {}", class_name, class.value);
        } else {
            attributes.insert(
                "class".to_string(),
                virt::Attribute {
                    source_id: None,
                    name: "class".to_string(),
                    value: class_name,
                },
            );
        }
    }

    // resolve assets
    if element.namespace == None {
        if element.tag_name.as_str() == "img" {
            if let Some(src) = attributes.get_mut("src") {
                if !src.value.starts_with("http://") && !src.value.starts_with("https://") {
                src.value = context
                    .file_resolver
                    .resolve_file(&context.path, &src.value)
                    .unwrap()
                }
            }
        }
    }
}

fn create_instance_params<F: FileResolver>(
    element: &ast::Element,
    context: &DocumentContext<F>,
) -> core_virt::Obj {
    let mut properties = vec![];

    for param in &element.parameters {
        evaluate_instance_param(param, &mut properties, context);
    }

    core_virt::Obj {
        source_id: Some(element.id.to_string()),
        properties,
    }
}

fn evaluate_instance_param<F: FileResolver>(
    param: &ast::Parameter,
    properties: &mut Vec<core_virt::ObjectProperty>,
    context: &DocumentContext<F>,
) {
    properties.push(core_virt::ObjectProperty {
        source_id: Some(param.id.to_string()),
        name: param.name.to_string(),
        value: Some(create_attribute_value(
            param.value.as_ref().expect("Value must exist"),
            context,
        )),
    });
}

fn create_attribute_value<F: FileResolver>(
    value: &ast::SimpleExpression,
    context: &DocumentContext<F>,
) -> core_virt::Value {
    match value.get_inner() {
        ast::simple_expression::Inner::Str(value) => core_virt::value::Inner::Str(core_virt::Str {
            value: value.value.to_string(),
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Bool(value) => {
            core_virt::value::Inner::Bool(core_virt::Bool {
                value: value.value,
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Num(value) => core_virt::value::Inner::Num(core_virt::Num {
            value: value.value,
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
        ast::simple_expression::Inner::Reference(value) => {
            if let Some(data) = &context.data {
                if let Some(value) = data.get_deep(&value.path) {
                    return value.clone();
                }
            }

            core_virt::value::Inner::Undef(core_virt::Undefined {
                source_id: Some(value.id.to_string()),
            })
            .get_outer()
        }
        ast::simple_expression::Inner::Ary(value) => core_virt::value::Inner::Ary(core_virt::Ary {
            items: vec![],
            source_id: Some(value.id.to_string()),
        })
        .get_outer(),
    }
}

fn evaluate_text_node<F: FileResolver>(
    text_node: &ast::TextNode,
    fragment: &mut Vec<virt::Node>,
    metadata: &Option<virt::NodeMedata>,
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
            attributes: vec![virt::Attribute {
                source_id: None,
                name: "class".to_string(),
                value: class_name.to_string(),
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
