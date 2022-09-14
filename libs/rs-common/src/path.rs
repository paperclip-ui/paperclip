#[macro_export]
macro_rules! join_path {
  ($part: expr, $($rest: expr), +) => {{
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
