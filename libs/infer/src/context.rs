use paperclip_proto::ast;
use paperclip_proto::ast::graph_ext::{Dependency, Graph};
use std::{cell::RefCell, rc::Rc};

use crate::{infer::Inferencer, types};

#[derive(Clone)]
pub struct Scope {
    pub root_type: types::Type,
    pub path: Vec<(String, bool)>,
}

impl Scope {
    pub fn step_in(&mut self, property: &str, optional: bool) {
        self.path.push((property.to_string(), optional));
    }

    pub fn step_out(&mut self) {
        self.path.pop();
    }
    pub fn set_scope_type(&mut self, value: types::Type) {
        self.root_type = set_scope_type(&self.path, 0, &self.root_type, value);
    }
    pub fn get_scope_type(&mut self) -> &types::Type {
        let mut curr = &self.root_type;
        for (part, _optional) in &self.path {
            if let types::Type::Map(map) = curr {
                curr = &map
                    .get(part)
                    .unwrap_or(&types::MapProp {
                        prop_type: types::Type::Unknown,
                        optional: true,
                    })
                    .prop_type
            }
        }

        curr
    }
}

fn set_scope_type(
    scope: &Vec<(String, bool)>,
    index: usize,
    owner: &types::Type,
    new_type: types::Type,
) -> types::Type {
    if let Some((part, optional)) = scope.get(index) {
        let optional = *optional;
        let mut new_owner = types::Map::new();
        if let types::Type::Map(prev_owner) = owner {
            new_owner.extend(prev_owner.clone());
        }

        new_owner.insert(
            part.to_string(),
            types::MapProp {
                prop_type: set_scope_type(
                    scope,
                    index + 1,
                    &new_owner
                        .get(part)
                        .unwrap_or(&types::MapProp {
                            prop_type: types::Type::Unknown,
                            optional: false,
                        })
                        .prop_type,
                    new_type,
                ),
                optional,
            },
        );

        types::Type::Map(new_owner)
    } else {
        new_type
    }
}

#[derive(Clone)]
pub struct InferContext<'graph, 'infer> {
    pub scope: Rc<RefCell<Scope>>,
    pub dependency: &'graph Dependency,
    pub graph: &'graph Graph,
    pub inferencer: &'infer Inferencer,
    pub current_instance_inference: Option<types::Map>,
    pub current_parameter: Option<&'graph ast::pc::Parameter>,
}

impl<'graph, 'infer> InferContext<'graph, 'infer> {
    pub fn new(
        dependency: &'graph Dependency,
        graph: &'graph Graph,
        inferencer: &'infer Inferencer,
    ) -> Self {
        Self {
            scope: Rc::new(RefCell::new(Scope {
                root_type: types::Type::Unknown,
                path: vec![],
            })),
            graph,
            dependency,
            inferencer,
            current_instance_inference: None,
            current_parameter: None,
        }
    }
    pub fn step_in(&self, path: &str, optional: bool) {
        self.scope.as_ref().borrow_mut().step_in(path, optional);
    }
    pub fn step_out(&self) {
        self.scope.as_ref().borrow_mut().step_out();
    }
    pub fn set_scope_type(&self, scope_type: types::Type) {
        self.scope.as_ref().borrow_mut().set_scope_type(scope_type);
    }
    pub fn with_instance_inference(&self, inference: types::Map) -> Self {
        InferContext {
            current_instance_inference: Some(inference),
            ..self.clone()
        }
    }
    pub fn within_parameter(&self, param: &'graph ast::pc::Parameter) -> Self {
        InferContext {
            current_parameter: Some(param),
            ..self.clone()
        }
    }
}
