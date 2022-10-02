use crate::{get_document_info, ColorInfo, ColorValue, DocumentInfo, Position};
use paperclip_parser::pc::parser::parse;

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
      value: Some(ColorValue {
        red: 255.0,
        green: 102.0,
        blue: 0.0,
        alpha: 1.0
      }),
      position: Some(Position {

        start: 11,
        end: 18
      })
    }]
  }
}

test_case! {
  can_pull_colors_from_keyword,
  "token test red",
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Some(ColorValue {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 1.0
      }),
      position: Some(Position {

      start: 11,
      end: 14
      })
    }]
  }
}
test_case! {
  can_pull_colors_from_rgba,
  "token test rgba(255, 0, 0, 0.5)",
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Some(ColorValue {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 0.5
      }),
      position: Some(Position {

      start: 11,
      end: 31
      })
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
      value: Some(ColorValue {
        red: 0.0,
        green: 0.0,
        blue: 255.0,
        alpha: 1.0
      }),

      position: Some(Position {

      start: 32,
      end: 36
      })
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
      value: Some(ColorValue {
        red: 255.0,
        green: 165.0,
        blue: 0.0,
        alpha: 1.0
      }),

      position: Some(Position {

      start: 40,
      end: 46
      })
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
      value: Some(ColorValue {
        red: 128.0,
        green: 0.0,
        blue: 128.0,
        alpha: 1.0
      }),

      position: Some(Position {

      start: 71,
      end: 77
      })
    }]
  }
}

test_case! {
  can_pull_colors_out_of_text,
  r#"
    text "abba" {
      style {
        color: blue
      }
    }
    "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Some(ColorValue {
        red: 0.0,
        green: 0.0,
        blue: 255.0,
        alpha: 1.0
      }),

      position: Some(Position {

      start: 48,
      end: 52
      })
    }]
  }
}

test_case! {
  can_pull_colors_out_of_text_within_elements,
  r#"
    div {
      text "aba" {
        style {
          color: red
        }
      }
    }
    "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Some(ColorValue {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 1.0
      }),

      position: Some(Position {

      start: 63,
      end: 66
      })
    }]
  }
}

test_case! {
  can_pull_colors_out_of_default_slot_children,
  r#"
    component AB {
      render slot ab {
        div {
          style {
            color: red
          }
        }
      }
    }
  "#,
  DocumentInfo {
    colors: vec![ColorInfo {
      value: Some(ColorValue {
        red: 255.0,
        green: 0.0,
        blue: 0.0,
        alpha: 1.0
      }),

      position: Some(Position {
        start: 94,
        end: 97
      })
    }]
  }
}


test_case! {
  can_pull_colors_out_of_inserted_elements,
  r#"
    div {
      insert ab {
        div {
          style {
            color: red
          }
        }
        text "ab" {
          style {
            color: blue
          }
        }
      }
    }
  "#,
  DocumentInfo {
    colors: vec![
      ColorInfo {
        value: Some(ColorValue {
          red: 255.0,
          green: 0.0,
          blue: 0.0,
          alpha: 1.0
        }),
  
        position: Some(Position {
          start: 80,
          end: 83
        })
      },
      ColorInfo {
        value: Some(ColorValue {
          red: 0.0,
          green: 0.0,
          blue: 255.0,
          alpha: 1.0
        }),
  
        position: Some(Position {
          start: 163,
          end: 167
        })
      }
    ]
  }
}
