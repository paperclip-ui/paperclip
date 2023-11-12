use std::cell::RefCell;
use std::rc::Rc;

use paperclip_common::fs::FileResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::pc as ast;
use paperclip_proto::virt::html;

#[derive(Clone)]
pub struct Options {
    pub include_components: bool,
}

#[derive(Clone)]
pub struct DocumentContext<'graph, 'expr, 'file_resolver, FR: FileResolver> {
    pub graph: &'graph Graph,
    pub path: String,
    pub data: Option<html::Obj>,
    pub file_resolver: &'file_resolver FR,
    pub current_component: Option<&'expr ast::Component>,
    pub instance_ids: Vec<String>,
    pub render_scopes: Vec<String>,
    pub options: Options,
    pub id_generator: Rc<RefCell<IDGenerator>>,
}

impl<'graph, 'expr, 'file_resolver, FR: FileResolver>
    DocumentContext<'graph, 'expr, 'file_resolver, FR>
{
    pub fn new(
        path: &str,
        graph: &'graph Graph,
        file_resolver: &'file_resolver FR,
        options: Options,
    ) -> Self {
        Self {
            graph,
            path: path.to_string(),
            data: None,
            file_resolver,
            options,
            id_generator: Rc::new(RefCell::new(IDGenerator::new(get_document_id(path)))),
            current_component: None,
            render_scopes: vec![],
            instance_ids: vec![],
        }
    }
    pub fn with_data(&self, data: html::Obj) -> Self {
        let mut clone = self.clone();
        clone.data = Some(data);
        clone
    }
    pub fn within_component(&self, component: &'expr ast::Component) -> Self {
        let mut clone = self.clone();
        clone.current_component = Some(component);
        clone
    }
    pub fn within_instance(&self, instance_id: &str) -> Self {
        let mut clone = self.clone();
        clone.instance_ids.push(instance_id.to_string());
        clone
    }
    pub fn within_path(&self, path: &str) -> Self {
        let mut clone = self.clone();
        clone.path = path.to_string();
        clone
    }
    pub fn set_render_scope(&self, scope: Vec<String>) -> Self {
        let mut clone = self.clone();
        clone.render_scopes = scope;
        clone
    }
}
