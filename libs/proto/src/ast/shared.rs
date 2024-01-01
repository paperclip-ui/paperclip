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
        let (info, ref_dep) = graph
            .get_expr(&self.id)
            .expect("Dependency must exist (reference follow)");

        if self.path.len() == 2 {
            let namespace = self.path.get(0).expect("Namespace must exist");
            let name = self.path.get(1).expect("Name must exist");

            if let Some(other_dep) = ref_dep.resolve_import_from_ns(namespace, graph) {
                other_dep
                    .get_document()
                    .get_export(&name)
                    .and_then(|expr| Some((expr, other_dep)))
            } else {
                None
            }
        } else if self.path.len() == 1 {
            let name = self.path.get(0).expect("Name must exist");
            for id in info.path.iter().rev() {
                let reference = graph.get_expr(id).expect("Must exist");

                if let ExpressionWrapper::Component(component) = reference.0.expr {
                    if let Some(variant) = component.get_variant(&name) {
                        return Some((variant.into(), reference.1));
                    }
                }
            }

            ref_dep
                .get_document()
                .get_export(&name)
                .and_then(|expr| Some((expr, ref_dep)))
        } else {
            None
        }
    }
}
