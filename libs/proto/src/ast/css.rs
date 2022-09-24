include!(concat!(env!("OUT_DIR"), "/ast.css.rs"));

impl declaration_value::Value {
  pub fn wrap(self) -> DeclarationValue {
    DeclarationValue {
      value: Some(self)
    }
  }
}