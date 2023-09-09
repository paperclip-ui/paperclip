use anyhow::{Error, Result};
use lazy_static::lazy_static;
use paperclip_proto::ast;
use std::cell::RefCell;
use std::collections::HashMap;
use std::{collections::BTreeMap, rc::Rc};

use crate::context::InferContext;
use crate::types;
use paperclip_common::get_or_short;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};

pub struct Inferencer {
    component_cache: Rc<RefCell<BTreeMap<String, types::Component>>>,
}

impl Inferencer {
    pub fn new() -> Self {
        Self {
            component_cache: Rc::new(RefCell::new(BTreeMap::new())),
        }
    }
    pub fn infer_dependency(&self, path: &str, graph: &Graph) -> Result<types::Map> {
        let dep = get_or_short!(
            graph.dependencies.get(path),
            Err(Error::msg("Dependency doesn't exist"))
        );
        let mut context = InferContext::new(dep, graph, &self);

        infer_dep(dep, &mut context)?;

        let ret = context.scope.borrow().root_type.into_map();
        ret
    }
    pub fn infer_component(
        &self,
        component: &ast::pc::Component,
        path: &str,
        graph: &Graph,
    ) -> Result<types::Component> {
        let dep = get_or_short!(
            graph.dependencies.get(path),
            Err(Error::msg("Dependency doesn't exist"))
        );

        let cache_key = format!("{}-{}", dep.hash, component.name);

        if let Some(inference) = self.component_cache.borrow().get(&cache_key) {
            return Ok(inference.clone());
        }

        let mut context = InferContext::new(dep, graph, &self);

        infer_component(component, &mut context)?;

        self.component_cache.borrow_mut().insert(
            cache_key.to_string(),
            context.scope.borrow().root_type.into_component()?,
        );

        Ok(self
            .component_cache
            .borrow()
            .get(&cache_key)
            .unwrap()
            .clone())
    }
}

fn infer_dep(dep: &Dependency, context: &mut InferContext) -> Result<()> {
    for component in dep
        .document
        .as_ref()
        .expect("Document must exist")
        .get_components()
    {
        context.step_in(&component.name, true);
        infer_component(component, context)?;
        context.step_out();
    }
    Ok(())
}

fn infer_component(component: &ast::pc::Component, context: &mut InferContext) -> Result<()> {
    if let Some(render) = component.get_render_expr() {
        infer_render_node(
            render.node.as_ref().expect("Node must exist").get_inner(),
            context,
        )?;
    }
    let properties =
        if let types::Type::Map(properties) = &context.scope.borrow_mut().get_scope_type() {
            properties.clone()
        } else {
            types::Map::new()
        };

    context.set_scope_type(types::Type::Component(types::Component { properties }));
    Ok(())
}

fn infer_render_node(node: &ast::pc::node::Inner, context: &mut InferContext) -> Result<()> {
    match node {
        ast::pc::node::Inner::Element(expr) => {
            infer_element(expr, context)?;
        }
        _ => {}
    }
    Ok(())
}

fn infer_element(expr: &ast::pc::Element, context: &mut InferContext) -> Result<()> {
    if let Some(name) = &expr.name {
        let el_type = types::Element {
            id: name.to_string(),
            tag_name: expr.tag_name.to_string(),
            namespace: expr.namespace.clone(),
        };
        context.step_in(
            name,
            el_type
                .get_instance_component(&context.dependency.path, &context.graph)
                .is_none(),
        );
        context.set_scope_type(types::Type::Element(el_type));
        context.step_out();
    }
    infer_attributes(expr, context)?;
    for child in &expr.body {
        infer_node(child, context)?;
    }
    Ok(())
}

fn infer_slot(expr: &ast::pc::Slot, context: &mut InferContext) -> Result<()> {
    context.step_in(&expr.name, true);
    context.set_scope_type(types::Type::Slot);
    context.step_out();
    Ok(())
}

fn infer_insert(expr: &ast::pc::Insert, context: &mut InferContext) -> Result<()> {
    for child in &expr.body {
        infer_node(child, context)?;
    }
    Ok(())
}

fn infer_node(expr: &ast::pc::Node, context: &mut InferContext) -> Result<()> {
    match expr.get_inner() {
        ast::pc::node::Inner::Element(child) => {
            infer_element(child, context)?;
        }
        ast::pc::node::Inner::Slot(child) => {
            infer_slot(child, context)?;
        }
        ast::pc::node::Inner::Insert(child) => {
            infer_insert(child, context)?;
        }
        _ => {}
    }
    Ok(())
}

fn infer_attributes(expr: &ast::pc::Element, context: &mut InferContext) -> Result<()> {
    let instance_props = infer_instance(expr, context)?;
    let context = context.with_instance_inference(instance_props);

    for attr in &expr.parameters {
        infer_simple_expression(
            attr.value.as_ref().expect("Value must exist").get_inner(),
            &mut context.within_parameter(attr),
        );
    }
    Ok(())
}

fn infer_simple_expression(value: &ast::pc::simple_expression::Inner, context: &mut InferContext) {
    let current_parameter = get_or_short!(context.current_parameter, ());
    let instance_inference = get_or_short!(&context.current_instance_inference, ());
    let prop_inference =
        instance_inference
            .get(&current_parameter.name)
            .unwrap_or(&types::MapProp {
                prop_type: types::Type::Unknown,
                optional: true,
            });

    match value {
        ast::pc::simple_expression::Inner::Reference(expr) => {
            if expr.path.len() == 1 {
                if let Some(part) = expr.path.get(0) {
                    context.step_in(part, true);
                    context.set_scope_type(prop_inference.clone().prop_type);
                    context.step_out();
                }
            }
        }
        _ => {}
    }
}

lazy_static! {
    static ref NATIVE_ELEMENT_TYPES: HashMap<&'static str, types::Map> = {
        let mouse_event_type = types::MapProp {
            prop_type: types::Type::Callback(types::Callback {
                arguments: vec![types::Type::Reference(types::Reference {
                    path: vec!["MouseEvent".to_string()],
                })],
            }),
            optional: true,
        };

        let base_el_type = types::Map::from([
            ("onclick".to_string(), mouse_event_type.clone()),
            ("onmousedown".to_string(), mouse_event_type.clone()),
            ("onmouseup".to_string(), mouse_event_type.clone()),
            ("onpress".to_string(), mouse_event_type.clone()),
            (
                "class".to_string(),
                types::MapProp {
                    prop_type: types::Type::String,
                    optional: true,
                },
            ),
        ]);

        HashMap::from([
            ("div", base_el_type.clone()),
            ("span", base_el_type.clone()),
        ])
    };
}

fn infer_instance(expr: &ast::pc::Element, context: &InferContext) -> Result<types::Map> {
    // TODO: decouple this from inference engine
    let native_element_props = NATIVE_ELEMENT_TYPES.get(expr.tag_name.as_str());

    if let Some(props) = native_element_props {
        return Ok(props.clone());
    }

    let instance_dep = if let Some(namespace) = &expr.namespace {
        let imports = context
            .dependency
            .document
            .as_ref()
            .expect("Document must exist")
            .get_imports();
        let import = imports.iter().find(|import| &import.namespace == namespace);

        import
            .and_then(|import| context.dependency.imports.get(&import.path))
            .and_then(|imp_dep| context.graph.dependencies.get(imp_dep))
    } else {
        Some(context.dependency)
    };

    if let Some(instance_dep) = instance_dep {
        for component in instance_dep
            .document
            .as_ref()
            .expect("Document must exist")
            .get_components()
        {
            if component.name == expr.tag_name {
                return Ok(context
                    .inferencer
                    .infer_component(component, &context.dependency.path, context.graph)?
                    .properties
                    .clone());
            }
        }
    }

    infer_unknown_element(expr, context)
}

fn infer_unknown_element(expr: &ast::pc::Element, _context: &InferContext) -> Result<types::Map> {
    let mut map = types::Map::new();

    for param in &expr.parameters {
        map.insert(
            param.name.to_string(),
            types::MapProp {
                prop_type: types::Type::Unknown,
                optional: true,
            },
        );
    }

    Ok(map)
}
