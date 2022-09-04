use super::state as ast;

trait Visitor<T> {
  fn visit_parameter(expr: &ast::Parameter) -> T;
  fn visit_simpl_expr(expr: &ast::SimpleExpression) -> T;
  fn visit_element(expr: &ast::Element) -> T;
}