#[macro_export]
macro_rules! join_path {
  ($part: expr, $($rest: expr), +) => {{
      use std::path::Path;
      use path_absolutize::*;
      Path::new($part)
      $(
          .join($rest)
      )+
      .absolutize()
      .unwrap()
      .to_str()
      .unwrap()
      .to_string()
  }};
}
