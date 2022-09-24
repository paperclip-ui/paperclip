
#[macro_export]
macro_rules! add_wrapper {
  ($path: path, $type: ident) => {
      impl $path {
          pub fn wrap(self) -> $type {
              $type { value: Some(self) }
          }
      }
  };
}

#[macro_export]
macro_rules! add_inner_wrapper {
  ($path: path, $type: ident) => {
      impl $path {
          pub fn wrap(self) -> $type {
              $type { inner: Some(self) }
          }
      }

      impl $type {
        pub fn get_inner(&self) -> &$path {
            self.inner.as_ref().expect("Inner must exist")
        }
      }
  };
}