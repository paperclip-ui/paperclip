use super::all::Visitor;
use crate::ast::all::Visitable;
use paperclip_proto::ast::pc::Component;

pub struct FindSlotNames {
    found: Vec<String>,
}

impl Visitor<()> for FindSlotNames {
    fn visit_slot(
        &mut self,
        expr: &paperclip_proto::ast::pc::Slot,
    ) -> super::all::VisitorResult<()> {
        self.found.push(expr.name.clone());
        super::all::VisitorResult::Continue
    }
}

impl FindSlotNames {
    pub fn find_slot_names(component: &Component) -> Vec<String> {
        let mut imp = FindSlotNames { found: vec![] };
        component.accept(&mut imp);
        imp.found.clone()
    }
}
