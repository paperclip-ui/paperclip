use std::path::PathBuf;

#[cfg(not(target_arch = "wasm32"))]
pub fn absolutize(pt: PathBuf) -> PathBuf {
    use path_absolutize::*;
    pt.absolutize().unwrap().to_path_buf()
}

#[cfg(target_arch = "wasm32")]
pub fn absolutize(pt: PathBuf) -> PathBuf {
    pt
}

#[macro_export]
macro_rules! join_path {
  ($part: expr, $($rest: expr), +) => {{
      use std::path::Path;
      absolutize(Path::new($part)
      $(
          .join($rest)
      )+
      )
      .to_str()
      .unwrap()
      .to_string()
  }};
}
