use paperclip_proto::ast::all::visit::{Visitable, Visitor, VisitorResult};
use paperclip_proto::ast::pc::Component;

pub struct FindSlotNames {
    found: Vec<String>,
}

impl Visitor<()> for FindSlotNames {
    fn visit_slot(&mut self, expr: &paperclip_proto::ast::pc::Slot) -> VisitorResult<()> {
        self.found.push(expr.name.clone());
        VisitorResult::Continue
    }
}

impl FindSlotNames {
    pub fn find_slot_names(component: &Component) -> Vec<String> {
        let mut imp = FindSlotNames { found: vec![] };
        component.accept(&mut imp);
        imp.found.clone()
    }
}
