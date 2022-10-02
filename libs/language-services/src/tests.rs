use paperclip_parser::pc::parser::parse;
use crate::{DocumentInfo, Color, ColorInfo, get_document_info};


macro_rules! test_case {
    ($name: ident, $source: expr, $expected: expr) => {
        #[test]
        fn $name() {
          let ast = parse($source, &"entry.pc".to_string()).unwrap();
          let info = get_document_info(&ast);
          assert_eq!(info, $expected);
        }
    };
}


test_case! {
  can_pull_hex_color_from_atom,
  "token test #FF6600",
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 255.0,
        green: 102.0,
        blue: 0.0,
        alpha: 1.0
      },
      start: 11,
      end: 18
    }]
  }
}

test_case! {
  can_pull_colors_from_keyword,
  "token test red",
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 1.0
      },
      start: 11,
      end: 14
    }]
  }
}
test_case! {
  can_pull_colors_from_rgba,
  "token test rgba(255, 0, 0, 0.5)",
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 0.5
      },
      start: 11,
      end: 31
    }]
  }
}

test_case! {
  can_pull_colors_from_a_style,
  r#"
    style test { 
      color: blue 
    }
    "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 0.0,
        green: 0.0,
        blue: 255.0,
        alpha: 1.0
      },
      start: 33,
      end: 37
    }]
  }
}

test_case! {
  can_pull_colors_from_an_element,
  r#"
    div {
      style {
        color: orange
      }
    }
    "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 255.0,
        green: 165.0,
        blue: 0.0,
        alpha: 1.0
      },
      start: 41,
      end: 47
    }]
  }
}


test_case! {
  can_pull_colors_from_component_element,
  r#"
    component A {
      render div {
        style {
          color: purple
        }
      }
    }
    "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Color {
        red: 128.0,
        green: 0.0,
        blue: 128.0,
        alpha: 1.0
      },
      start: 72,
      end: 78
    }]
  }
}