use itertools::Itertools;
use paperclip_ast_serialize::{docco::serialize_comment, serializable::Serializable};
use paperclip_common::serialize_context::Context as SerializeContext;
use paperclip_proto::ast::{
    expr_map::ExprMap,
    graph::Graph,
    pc::Element,
    visit::{Visitable, Visitor, VisitorResult},
    wrapper::ExpressionWrapper,
};

use std::cell::RefCell;
use std::rc::Rc;

struct CaptureNamespaces {
    namespaces: Rc<RefCell<Vec<String>>>,
}

impl CaptureNamespaces {
    fn get_namespaces(expr: &ExpressionWrapper) -> Vec<String> {
        let visitor = CaptureNamespaces {
            namespaces: Rc::new(RefCell::new(vec![])),
        };

        Visitable::accept(&expr, &visitor);

        visitor.namespaces.clone().borrow().clone()
    }
}

impl Visitor<()> for CaptureNamespaces {
    fn visit_element(&self, expr: &Element) -> VisitorResult<(), Self> {
        if let Some(namespace) = &expr.namespace {
            self.namespaces.borrow_mut().push(namespace.clone());
        }
        VisitorResult::Continue
    }
}

pub fn copy_expression(expr_id: &str, graph: &Graph) -> String {
    let expr_map = ExprMap::from_graph(graph);

    let expr = expr_map.get_expr(expr_id).expect("Expr must exist");

    let mut ctx = SerializeContext::new(0);

    if let ExpressionWrapper::Component(component) = &expr {
        ctx.add_buffer(&format!(
            "import \"{}\" as mod\n",
            expr_map
                .get_expr_path(&component.id)
                .as_ref()
                .expect("Path must exist")
        ));
        if let Some(comment) = &component.comment {
            serialize_comment(comment, &mut ctx);
            ctx.add_buffer("\n");
        }

        ctx.add_buffer("mod.");
        ctx.add_buffer(&component.name);
    } else {
        let namespaces: Vec<String> = CaptureNamespaces::get_namespaces(&expr)
            .into_iter()
            .unique()
            .collect();

        for namespace in namespaces {
            let import_path: String = expr_map
                .get_document_import_path(expr.get_id(), &namespace)
                .expect("path must exist");
            ctx.add_buffer(format!("import \"{}\" as {}\n", import_path, namespace).as_str());
        }

        // println!("{:#?}", namespaces);

        ctx.add_buffer(expr.serialize(true).as_str())
    }

    ctx.buffer
}
