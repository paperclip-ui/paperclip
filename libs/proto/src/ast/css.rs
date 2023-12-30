use crate::add_inner_wrapper;

use super::base::Range;

include!(concat!(env!("OUT_DIR"), "/ast.css.rs"));

add_inner_wrapper!(declaration_value::Inner, DeclarationValue);

impl DeclarationValue {
    pub fn get_range(&self) -> &Option<Range> {
        match self.get_inner() {
            declaration_value::Inner::Arithmetic(expr) => &expr.range,
            declaration_value::Inner::CommaList(expr) => &expr.range,
            declaration_value::Inner::Keyword(expr) => &expr.range,
            declaration_value::Inner::FunctionCall(expr) => &expr.range,
            declaration_value::Inner::HexColor(expr) => &expr.range,
            declaration_value::Inner::Measurement(expr) => &expr.range,
            declaration_value::Inner::Number(expr) => &expr.range,
            declaration_value::Inner::Reference(expr) => &expr.range,
            declaration_value::Inner::SpacedList(expr) => &expr.range,
            declaration_value::Inner::Str(expr) => &expr.range,
        }
    }
}
