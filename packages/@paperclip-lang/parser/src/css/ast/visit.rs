
use super::state::*;
use crate::base::ast::visit::*;

visitable_expr! {
  StyleDeclaration,
  DeclarationValue,
  Reference,
  Arithmetic,
  Measurement,
  FunctionCall,
  HexColor,
  SpacedList,
  CommaList
}
