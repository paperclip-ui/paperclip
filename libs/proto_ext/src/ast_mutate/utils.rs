use std::fmt::Debug;

use crate::ast::all::{Visitable, Visitor, VisitorResult};

#[macro_export]
macro_rules! replace_child {
    ($children: expr, $child_id: expr, $new_child: expr) => {{
        let mut ret = VisitorResult::Continue;
        for (i, v) in $children.iter_mut().enumerate() {
            if v.get_id() == $child_id {
                std::mem::replace(v, ($new_child)(v));
                ret = VisitorResult::Return(());
                break;
            }
        }
        ret
    }};
}

struct GetNamed {
    name: String,
}

impl Visitor<String> for GetNamed {
    fn visit_slot(&mut self, expr: &paperclip_proto::ast::pc::Slot) -> VisitorResult<String> {
        if expr.name == self.name {
            return VisitorResult::Return(expr.id.to_string());
        }

        VisitorResult::Continue
    }
}

pub fn get_named_expr_id<TVisitable: Visitable + Debug>(
    name: &str,
    scope: &TVisitable,
) -> Option<String> {
    let mut imp = GetNamed {
        name: name.to_string(),
    };

    if let VisitorResult::Return(id) = scope.accept(&mut imp) {
        Some(id)
    } else {
        None
    }
}
