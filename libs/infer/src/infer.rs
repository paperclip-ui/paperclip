use anyhow::{Error, Result};
use lazy_static::lazy_static;
use paperclip_common::id::get_document_id;
use paperclip_proto::ast;
use std::cell::RefCell;
use std::collections::HashMap;
use std::{collections::BTreeMap, rc::Rc};

use crate::context::InferContext;
use crate::types;
use paperclip_common::get_or_short;
use paperclip_parser::graph::{Dependency, Graph};

pub struct Inferencer {
    dep_cache: Rc<RefCell<BTreeMap<String, types::Map>>>,
}

impl Inferencer {
    pub fn new() -> Self {
        Self {
            dep_cache: Rc::new(RefCell::new(BTreeMap::new())),
        }
    }
    pub fn infer_dependency<'a>(&'a self, path: &str, graph: &Graph) -> Result<types::Map> {
        let dep = get_or_short!(
            graph.dependencies.get(path),
            Err(Error::msg("Dependency doesn't exist"))
        );
        if let Some(inference) = self.dep_cache.borrow().get(&dep.hash) {
            return Ok(inference.clone());
        }

        let dep_inference = infer_dep(dep, &mut InferContext::new(dep, graph, &self));

        self.dep_cache
            .borrow_mut()
            .insert(dep.hash.to_string(), dep_inference.clone());

        Ok(self.dep_cache.borrow().get(&dep.hash).unwrap().clone())
    }
}

fn infer_dep(dep: &Dependency, context: &mut InferContext) -> types::Map {
    for component in &dep.document.get_components() {
        infer_component(component, context);
    }

    if let types::Type::Map(map) = &context.scope.borrow().root_type {
        map.clone()
    } else {
        types::Map::new()
    }
}

fn infer_component(component: &ast::pc::Component, context: &mut InferContext) {
    context.step_in(&component.name);
    if let Some(render) = component.get_render_expr() {
        infer_render_node(
            render.node.as_ref().expect("Node must exist").get_inner(),
            context,
        );
    }
    let properties =
        if let types::Type::Map(properties) = &context.scope.borrow_mut().get_scope_type() {
            properties.clone()
        } else {
            types::Map::new()
        };

    context.set_scope_type(types::Type::Component(types::Component { properties }));
    context.step_out();
}

fn infer_render_node(node: &ast::pc::render_node::Inner, context: &mut InferContext) {
    match node {
        ast::pc::render_node::Inner::Element(expr) => {
            infer_element(expr, context);
        }
        _ => {}
    }
}

fn infer_element(expr: &ast::pc::Element, context: &mut InferContext) {
    infer_attributes(expr, context);
}

fn infer_attributes(expr: &ast::pc::Element, context: &mut InferContext) {
    let instance_props = infer_instance(expr, context);
    let mut context = context.with_instance_inference(instance_props);

    for attr in &expr.parameters {
        infer_simple_expression(
            attr.value.as_ref().expect("Value must exist").get_inner(),
            &mut context.within_parameter(attr),
        );
    }
}

fn infer_simple_expression(value: &ast::pc::simple_expression::Inner, context: &mut InferContext) {
    let current_parameter = get_or_short!(context.current_parameter, ());
    let instance_inference = get_or_short!(&context.current_instance_inference, ());
    let prop_inference = instance_inference
        .get(&current_parameter.name)
        .unwrap_or(&types::Type::Unknown);

    println!(
        "PROP INFF {:?} {:?}",
        current_parameter.name, instance_inference
    );

    // if !instance_inference.contains_key(&current_parameter.name) {
    //     return;
    // }

    match value {
        ast::pc::simple_expression::Inner::Reference(expr) => {
            if expr.path.len() == 1 {
                if let Some(part) = expr.path.get(0) {
                    context.step_in(part);
                    context.set_scope_type(prop_inference.clone());
                    context.step_out();
                }
            }
        }
        _ => {}
    }
}

lazy_static! {
    static ref NATIVE_ELEMENT_TYPES: HashMap<&'static str, types::Map> = {
        let mouse_event_type = types::Type::Callback(types::Callback {
            arguments: vec![types::Type::Reference(types::Reference {
                path: vec!["MouseEvent".to_string()],
            })],
        });

        let base_el_type = types::Map::from([
            ("onclick".to_string(), mouse_event_type.clone()),
            ("onmousedown".to_string(), mouse_event_type.clone()),
            ("onmouseup".to_string(), mouse_event_type.clone()),
            ("onpress".to_string(), mouse_event_type.clone()),
            ("class".to_string(), types::Type::String),
        ]);

        HashMap::from([
            ("div", base_el_type.clone()),
            ("span", base_el_type.clone()),
        ])
    };
}

fn infer_instance(expr: &ast::pc::Element, context: &InferContext) -> types::Map {
    // TODO: decouple this from inference engine
    let native_element_props = NATIVE_ELEMENT_TYPES.get(expr.tag_name.as_str());

    if let Some(props) = native_element_props {
        return props.clone();
    }

    println!("INFFFF");

    if let Some(namespace) = &expr.namespace {
    } else {
        for component in context.dependency.document.get_components() {
            if component.name == expr.tag_name {
                let mut comp_inference = context.fork();
                infer_component(component, &mut comp_inference);

                // yuck
                let root = comp_inference.scope.as_ref().borrow_mut().root_type.clone();
                if let types::Type::Map(map) = root {
                    if let Some(inference) = map.get(&component.name) {
                        println!("DD {:?} {:?}", inference, component.name);
                        if let types::Type::Component(map) = inference {
                            return map.properties.clone();
                        }
                    }
                }
            }
        }
    }

    infer_unknown_element(expr, context)
}

fn infer_unknown_element(expr: &ast::pc::Element, context: &InferContext) -> types::Map {
    let mut map = types::Map::new();

    for param in &expr.parameters {
        map.insert(param.name.to_string(), types::Type::Unknown);
    }

    map
}
