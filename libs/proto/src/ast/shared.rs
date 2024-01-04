use super::{expr_map::ExprMap, wrapper::ExpressionWrapper};

include!(concat!(env!("OUT_DIR"), "/ast.shared.rs"));

impl Reference {
    /**
     * Follows reference to source
     */
    pub fn follow<'a>(&'a self, map: &'a ExprMap) -> Option<ExpressionWrapper> {
        // let (info, ref_dep) = graph
        //     .get_expr(&self.id)
        //     .expect("Dependency must exist (reference follow)");

        if self.path.len() == 2 {
            let namespace = self.path.get(0).expect("Namespace must exist");
            let name = self.path.get(1).expect("Name must exist");

            map.get_document_import(&self.id, namespace)
                .and_then(|other_doc| other_doc.get_export(&name).and_then(|expr| Some(expr)))
        } else if self.path.len() == 1 {
            let name = self.path.get(0).expect("Name must exist");

            let variant_ref = map
                .get_owner_component(&self.id)
                .and_then(|component| component.get_variant(&name));

            if let Some(variant_ref) = variant_ref {
                return Some(variant_ref.clone().into());
            }

            return map
                .get_document(&self.id)
                .and_then(|document| document.get_export(name))
                .and_then(|expr| expr.into());
        } else {
            None
        }
    }
}
