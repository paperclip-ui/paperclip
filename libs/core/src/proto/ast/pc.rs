use paperclip_proto::ast::all::visit::{Visitable, Visitor, VisitorResult};
use paperclip_proto::ast::pc::Component;
use std::cell::RefCell;
use std::rc::Rc;

pub struct FindSlotNames {
    found: Rc<RefCell<Vec<String>>>,
}

impl Visitor<()> for FindSlotNames {
    fn visit_slot(
        &self,
        expr: &paperclip_proto::ast::pc::Slot,
    ) -> VisitorResult<(), FindSlotNames> {
        self.found.borrow_mut().push(expr.name.clone());
        VisitorResult::Continue
    }
}

impl FindSlotNames {
    pub fn find_slot_names(component: &Component) -> Vec<String> {
        let mut imp = FindSlotNames {
            found: Rc::new(RefCell::new(vec![])),
        };
        component.accept(&mut imp);
        let v = imp.found.borrow();
        v.clone()
    }
}
