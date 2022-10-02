
#[derive(PartialEq, Debug)]
pub struct Color {
  pub red: f32,
  pub green: f32,
  pub blue: f32,
  pub alpha: f32
}

#[derive(PartialEq, Debug)]
pub struct ColorInfo {
  pub value: Color,
  pub start: u32,
  pub end: u32
}

#[derive(PartialEq, Debug)]
pub struct DocumentInfo {
  pub colors: Vec<ColorInfo>
}