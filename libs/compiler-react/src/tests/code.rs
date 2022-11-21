use crate::compile_code;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::Dependency;
use paperclip_parser::pc::parser::parse;
use std::collections::HashMap;

// TODO: insert test

macro_rules! add_case {
    ($name: ident, $mock_content: expr, $expected_output: expr) => {
        #[test]
        fn $name() {
            let path = "/entry.pc".to_string();
            let ast = parse($mock_content, &path).unwrap();
            let dep = Dependency {
                hash: "a".to_string(),
                path: path.to_string(),
                imports: HashMap::new(),
                document: ast,
            };
            let output = compile_code(&dep).unwrap();
            println!("{}", output.as_str());
            assert_eq!(
                strip_extra_ws(output.as_str()),
                strip_extra_ws($expected_output)
            );
        }
    };
}

add_case! {
  can_compile_a_simple_component,
  r#"component A {
    render div {
      
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  can_compile_a_public_component,
  r#"public component A {
    render div {
      
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "ref": ref
        });
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  class_names_are_added_to_elements_with_styles,
  r#"public component A {
    render div {
      style {
        color: red
      }
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "className": "_A-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  element_names_are_included_as_classes,
  r#"public component A {
    render div ab {
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "className": "_A-ab-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  text_can_be_compiled,
  r#"public component A {
    render span {
      text "Hello"
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";

    const _A = (props, ref) => {
        return React.createElement("span", {
            "ref": ref
        }, [
            "Hello"
        ]);
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  attributes_can_be_compiled,
  r#"public component A {
    render span(aria-label: "something")
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("span", {
            "aria-label": "something",
            "ref": ref
        });
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  class_names_are_combined,
  r#"public component A {
    render span ab (class: "cd")
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("span", {
            "className": "cd" + " " + "_A-ab-80f4925f-3" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  can_render_nested_elements,
  r#"public component A {
    render span {
      div {

      }
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("span", {
            "ref": ref
        }, [
            React.createElement("div", null)
        ]);
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  text_nodes_can_be_used_in_render,
  r#"public component A {
    render text "ab"
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";

    const _A = (props, ref) => {
        return "ab";
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  slots_are_pulled_from_props,
  r#"public component A {
    render div {
      slot abba
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "ref": ref
        }, [
            props.abba
        ]);
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  slots_can_be_used_as_render_node,
  r#"public component A {
    render slot abba
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return props.abba;
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  default_slots_can_be_rendered,
  r#"public component A {
    render slot abba {
      text "a"
      div {
        text "b"
      }
    }
  }"#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return props.abba || [
            "a", 
            React.createElement("div", null, [
                "b"
            ])
        ];
    };
    _A.displayName = "A";
    export const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  instances_can_be_rendered,
  r#"
  component A {
    render slot abba
  }
  component B {
    render A
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return props.abba;
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
    
    const _B = (props, ref) => {
        return React.createElement(A, {
            "$$scopeClassName": "_B-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _B.displayName = "B";
    const B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  inserts_can_be_rendered,
  r#"
  component A {
    render slot abba
  }
  component B {
    render A {
      insert abba {
        text "Hello"
      }
    }
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return props.abba;
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
    
    const _B = (props, ref) => {
        return React.createElement(A, {
            "$$scopeClassName": "_B-80f4925f-6" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "abba": [
            "Hello"
        ],
            "ref": ref
        });
    };
    _B.displayName = "B";
    const B = React.memo(React.forwardRef(_B));
  "#
}

add_case! {
  can_compile_components_with_props,
  r#"
  component A {
    render div(onClick: onClick)
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _A = (props, ref) => {
        return React.createElement("div", {
            "onClick": props.onClick,
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  class_name_is_included_in_instance_if_root,
  r#"
  component B {
    render div root
  }
  component A {
    render B root
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    
    const _B = (props, ref) => {
        return React.createElement("div", {
            "className": "_B-root-80f4925f-1" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _B.displayName = "B";
    const B = React.memo(React.forwardRef(_B));
    
    const _A = (props, ref) => {
        return React.createElement(B, {
            "$$scopeClassName": "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
  "#
}

add_case! {
  can_import_files,
  r#"
  import "/test.pc" as test

  component A {
    render test.B
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
    const _A = (props, ref) => {
        return React.createElement(test.B, {
            "$$scopeClassName": "_A-80f4925f-2" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
  "#
}


add_case! {
  scoped_class_name_is_defined_on_instance,
  r#"
  import "/test.pc" as test

  component A {
    render div root (class:class)
  }

  component B {
    render div {
      A {
        override root {
          style {
            color: blue
          }
        }
      }
    }
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
    const _A = (props, ref) => {
        return React.createElement("div", {
            "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
    
    const _B = (props, ref) => {
        return React.createElement("div", {
            "ref": ref
        }, [
            React.createElement(A, {
                "$$scopeClassName": "_B-80f4925f-11"
            })
        ]);
    };
    _B.displayName = "B";
    const B = React.memo(React.forwardRef(_B));
  "#
}


add_case! {
  class_names_arent_renamed_if_instance,
  r#"
  import "/test.pc" as test

  component A {
    render div root (class:class)
  }

  component B {
    render A(class:"blarg")
  }
  "#,
  r#"
    require("./entry.pc.css");
    import * as React from "react";
    import * as test from "/test.pc";
    const _A = (props, ref) => {
        return React.createElement("div", {
            "className": props.class + " " + "_A-root-80f4925f-4" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "ref": ref
        });
    };
    _A.displayName = "A";
    const A = React.memo(React.forwardRef(_A));
    
    const _B = (props, ref) => {
        return React.createElement(A, {
            "$$scopeClassName": "_B-80f4925f-9" + (props.$$scopeClassName ? " " + props.$$scopeClassName : ""),
            "class": "blarg",
            "ref": ref
        });
    };
    _B.displayName = "B";
    const B = React.memo(React.forwardRef(_B));
  "#
}
