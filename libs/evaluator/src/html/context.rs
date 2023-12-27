use std::cell::RefCell;
use std::rc::Rc;

use paperclip_common::fs::FileResolver;
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast::pc as ast;
use paperclip_proto::notice::base::Notice;
use paperclip_proto::virt::html::Value;
use paperclip_proto::virt::{self, html};

#[derive(Clone)]
pub struct Options {
    pub include_components: bool,
}

#[derive(Clone)]
pub struct DocumentContext<'graph, 'expr, 'file_resolver, FR: FileResolver> {
    pub graph: &'graph Graph,
    pub path: String,
    pub preview_data: html::Obj,
    pub notices: Rc<RefCell<Vec<Notice>>>,
    pub data: html::Obj,
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
            notices: Rc::new(RefCell::new(vec![])),
            data: virt::html::Obj::new(None, vec![]),
            preview_data: virt::html::Obj::new(None, vec![]),
            file_resolver,
            options,
            id_generator: Rc::new(RefCell::new(IDGenerator::new(get_document_id(path)))),
            current_component: None,
            render_scopes: vec![],
            instance_ids: vec![],
        }
    }
    pub fn add_notice(&self, notice: Notice) {
        self.notices.borrow_mut().push(notice);
    }
    pub fn with_preview_data(&self, preview_data: html::Obj) -> Self {
        let mut clone = self.clone();
        clone.preview_data = preview_data;
        clone
    }

    pub fn with_data(&self, data: html::Obj) -> Self {
        let mut clone = self.clone();
        clone.data = data;
        clone
    }
    pub fn get_data(&self, name: &str) -> Option<&Value> {
        self.preview_data.get(name).or(self.data.get(name))
    }
    pub fn get_deep(&self, path: &Vec<String>) -> Option<&Value> {
        self.preview_data
            .get_deep(path)
            .or(self.data.get_deep(path))
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
