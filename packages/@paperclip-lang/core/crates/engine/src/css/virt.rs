// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model
pub struct StyleSheet {
  source_id: String
  items: Vec<StyleSheetItem>
}

pub enum StyleSheetItem {
  StyleRule(StyleRule),
  Keyframes(Keyframes),
  Charset(Charset)
}

pub struct StyleRule {
  source_id: String,
  items: Vec<StyleDeclaration>
}

pub struct StyleDeclaration {
  name: String;
  value: String;
}

pub struct FontFace {

}

pub struct Keyframes {

}

pub struct Charset {

}

