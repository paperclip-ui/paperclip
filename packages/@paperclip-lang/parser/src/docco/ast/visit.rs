
use super::state::*;
use crate::base::ast::visit::*;

visitable_expr! {
  Comment,
  CommentBodyItem,
  Property,
  PropertyValue,
  Parameters,
  Parameter,
  ParameterValue
}
