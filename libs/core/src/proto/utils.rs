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
