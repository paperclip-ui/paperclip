use super::{DeclarationValue, declaration_value};

impl declaration_value::Value {
  pub fn wrap(self) -> DeclarationValue {
    DeclarationValue {
      value: Some(self)
    }
  }
}