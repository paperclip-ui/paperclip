use super::{
    all::ExpressionWrapper,
    graph::{Dependency, Graph},
};

include!(concat!(env!("OUT_DIR"), "/ast.shared.rs"));

impl Reference {
    /**
     * Follows reference to source
     */
    pub fn follow<'a>(&'a self, graph: &'a Graph) -> Option<(ExpressionWrapper, &'a Dependency)> {
        let (_, ref_dep) = graph.get_expr_dep(&self.id).expect("Dependency must exist");

        let source = if self.path.len() == 2 {
            let namespace = self.path.get(0).expect("Namespace must exist");
            let name = self.path.get(1).expect("Name must exist");

            if let Some(ref_dep) = ref_dep.resolve_import_from_ns(namespace, graph) {
                Some((name.clone(), ref_dep))
            } else {
                None
            }
        } else if self.path.len() == 1 {
            let name = self.path.get(0).expect("Name must exist");
            Some((name.clone(), ref_dep))
        } else {
            None
        };

        if let Some((name, dep)) = source {
            dep.get_document()
                .get_export(&name)
                .and_then(|expr| Some((expr, dep)))
        } else {
            None
        }
    }
}
