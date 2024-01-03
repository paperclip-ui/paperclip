use std::{cell::RefCell, collections::HashMap, rc::Rc};

use crate::ast::graph::{Dependency, Graph};

use super::{
    base::*,
    css::*,
    docco::*,
    pc::*,
    shared::*,
    visit::{Visitable, Visitor, VisitorResult},
    wrapper::{Expression, ExpressionWrapper},
};

#[derive(Clone, Debug)]
pub struct ExprMapItem {
    pub expr: ExpressionWrapper,
    pub parent_id: Option<String>,
}

#[derive(Clone, Debug)]
pub struct DocumentMap {
    declarations: HashMap<String, ExpressionWrapper>,
    imports: HashMap<String, String>,
}

impl DocumentMap {
    fn from_dep(dep: &Dependency, graph: &Graph) -> Self {
        let document = dep.document.as_ref().expect("Document must exist");
        let imports = document.get_imports();

        let mut import_map: HashMap<String, String> = HashMap::new();
        for import in imports {
            let import_dep = dep
                .resolve_import_from_ns(&import.namespace, graph)
                .expect("Import must exist");
            import_map.insert(
                import.namespace.clone(),
                import_dep
                    .document
                    .as_ref()
                    .expect("Document must exist")
                    .id
                    .to_string(),
            );
        }

        Self {
            declarations: document.get_declarations(),
            imports: import_map,
        }
    }
}

#[derive(Clone, Default, Debug)]
pub struct ExprMap {
    document_maps: HashMap<String, DocumentMap>,
    map: HashMap<String, ExprMapItem>,
}

impl ExprMap {
    pub fn from_graph(graph: &Graph) -> Self {
        let mut map = ExprMap {
            map: HashMap::new(),
            document_maps: HashMap::new(),
        };
        for (_path, dep) in &graph.dependencies {
            map.map_dep(dep, graph);
        }
        map
    }

    pub fn get_expr<'a>(&'a self, id: &str) -> Option<&'a ExpressionWrapper> {
        self.map.get(id).and_then(|expr| Some(&expr.expr))
    }

    pub fn get_parent<'a>(&'a self, id: &str) -> Option<&'a ExpressionWrapper> {
        self.map.get(id).and_then(|expr| {
            expr.parent_id
                .as_ref()
                .and_then(|parent_id| self.get_expr(parent_id))
        })
    }

    fn map_dep(&mut self, dep: &Dependency, graph: &Graph) {
        let collector = ExprMapCollector::default();
        dep.accept(&collector);
        self.map.extend(collector.map.borrow().clone().into_iter());
        let document = dep.document.as_ref().expect("Document must exist");
        self.document_maps
            .insert(document.id.to_string(), DocumentMap::from_dep(dep, graph));
    }

    pub fn get_document<'a>(&'a self, expr_id: &str) -> Option<&'a Document> {
        self.find_ancestor(expr_id, |ancestor| {
            matches!(ancestor.expr, ExpressionWrapper::Document(_))
        })
        .and_then(|ancestor| Some(&ancestor.expr))
        .and_then(|ancestor| ancestor.try_into().ok())
    }

    pub fn get_document_import(&self, document_id: &str, namespace: &str) -> Option<&String> {
        self.document_maps
            .get(document_id)
            .and_then(|map| map.imports.get(namespace))
    }

    pub fn get_owner_document<'a>(&'a self, expr_id: &str) -> Option<&'a Document> {
        let expr = self.get_expr(expr_id)?;
        let expr_document = self.get_document(expr_id)?;
        let expr_doc_info = self.document_maps.get(expr_document.get_id())?;

        match expr {
            ExpressionWrapper::Element(expr) => {
                if let Some(namespace) = &expr.namespace {
                    let expr = &self.map.get(expr_doc_info.imports.get(namespace)?)?.expr;
                    expr.try_into().ok()
                } else {
                    Some(expr_document)
                }
            }
            _ => None,
        }
    }

    pub fn get_instance_component<'a>(&'a self, expr_id: &str) -> Option<&'a Component> {
        let expr = if let Some(ExpressionWrapper::Element(element)) = self.get_expr(expr_id) {
            Some(element)
        } else {
            None
        }?;

        let owner_doc = self.get_owner_document(expr_id)?;

        self.document_maps
            .get(owner_doc.get_id())?
            .declarations
            .get(&expr.tag_name)
            .and_then(|export| export.try_into().ok())
    }

    pub fn get_owner_component<'a>(&'a self, expr_id: &str) -> Option<&'a Component> {
        self.find_ancestor(expr_id, |ancestor| {
            matches!(ancestor.expr, ExpressionWrapper::Component(_))
        })
        .and_then(|ancestor| (&ancestor.expr).try_into().ok())
    }

    pub fn find_ancestor<'a, Search>(
        &'a self,
        expr_id: &str,
        search: Search,
    ) -> Option<&'a ExprMapItem>
    where
        Search: Fn(&ExprMapItem) -> bool,
    {
        let mut current_option: Option<&ExprMapItem> = self.map.get(expr_id);
        while let Some(current) = current_option {
            let parent_option: Option<&ExprMapItem> = current
                .parent_id
                .as_ref()
                .and_then(|parent_id| self.map.get(parent_id));
            if let Some(parent) = parent_option {
                if (search)(parent) {
                    return parent_option;
                }
            }

            current_option = parent_option;
        }
        None
    }
}

#[derive(Default, Clone)]
struct ExprMapCollector {
    current_parent_id: Option<String>,
    map: Rc<RefCell<HashMap<String, ExprMapItem>>>,
}

macro_rules! map_exprs {
    ($([$fn_name: ident, $expr: ty]),*) => {
        impl Visitor<()> for ExprMapCollector {
            $(
                fn $fn_name(&self, expr: &$expr) -> VisitorResult<(), Self> {
                    self.map.borrow_mut().insert(
                        expr.id.to_string(),
                        ExprMapItem {
                            expr: expr.into(),
                            parent_id: self.current_parent_id.clone(),
                        },
                    );
                    VisitorResult::Map(Box::new(Self {
                        current_parent_id: Some(expr.id.clone()),
                        ..self.clone()
                    }))
                }
            )*
        }
    };
}

map_exprs! {
    [visit_document, Document],
    [visit_import, Import],
    [visit_style, Style],
    [visit_css_declaration, StyleDeclaration],
    [visit_css_measurement, Measurement],
    [visit_css_keyword, Keyword],
    [visit_css_function_call, Box<FunctionCall>],
    [visit_css_bx_arithmetic, Box<Arithmetic>],
    [visit_css_hex_color, HexColor],
    [visit_css_comma_list, CommaList],
    [visit_css_spaced_list, SpacedList],
    [visit_component, Component],
    [visit_render, Render],
    [visit_script, Script],
    [visit_comment, Comment],
    [visit_text_node, TextNode],
    [visit_atom, Atom],
    [visit_ary, Ary],
    [visit_trigger, Trigger],
    [visit_parameter, Parameter],
    [visit_condition, Condition],
    [visit_switch, Switch],
    [visit_switch_case, SwitchCase],
    [visit_switch_default, SwitchDefault],
    [visit_repeat, Repeat],
    [visit_element, Element],
    [visit_slot, Slot],
    [visit_insert, Insert],
    [visit_override, Override],
    [visit_variant, Variant],
    [visit_trigger_body_combo, TriggerBodyItemCombo],
    [visit_reference, Reference],
    [visit_str, Str],
    [visit_num, Num],
    [visit_boolean, Bool]
}
