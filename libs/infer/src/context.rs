

use paperclip_parser::graph::{Graph, Dependency};

use crate::{types, infer::Inferencer};


pub struct Scope {
    pub root_type: types::Type,
    path: Vec<String>,
}

impl Scope {
    pub fn step_in(&mut self, property: &str) {
        self.path.push(property.to_string());
    }

    pub fn step_out(&mut self) {
        self.path.pop();
    }
    pub fn set_scope_type(&mut self, value: types::Type) {
        self.root_type = set_scope_type(&self.path, 0, &self.root_type, value);
    }
    pub fn get_scope_type(&mut self) -> &types::Type {
        let mut curr = &self.root_type;
        for part in &self.path {
            if let types::Type::Map(map) = curr {
                curr = map.get(part).unwrap_or(&types::Type::Unknown);
            }
        }

        curr
    }
}

fn set_scope_type(
    scope: &Vec<String>,
    index: usize,
    owner: &types::Type,
    new_type: types::Type,
) -> types::Type {
    if let Some(part) = scope.get(index) {
        let mut new_owner = types::Map::new();
        if let types::Type::Map(prev_owner) = owner {
            new_owner.extend(prev_owner.clone());
        }

        new_owner.insert(
            part.to_string(),
            set_scope_type(
                scope,
                index + 1,
                &new_owner.get(part).unwrap_or(&types::Type::Unknown),
                new_type,
            ),
        );

        types::Type::Map(new_owner)
    } else {
        new_type
    }
}

pub struct InferContext<'graph, 'infer> {
    pub scope: Scope,
    pub dependency: &'graph Dependency,
    graph: &'graph Graph,
    inferencer: &'infer Inferencer
}

impl<'graph, 'infer> InferContext<'graph, 'infer> {
    pub fn new(dependency: &'graph Dependency, graph: &'graph Graph, inferencer: &'infer Inferencer) -> Self {
        Self {
            scope: Scope { root_type: types::Type::Unknown, path: vec![] },
            graph,
            dependency,
            inferencer
        }
    }
}