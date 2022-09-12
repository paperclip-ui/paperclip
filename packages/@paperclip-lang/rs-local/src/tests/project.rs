use crate::config::{CompilerOptions, Config};
use crate::project::Project;
use crate::project_compiler::ProjectCompiler;
use futures::executor::block_on;
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::graph::Graph;
use paperclip_parser::graph::test_utils::MockFS;
use std::collections::HashMap;
use std::rc::Rc;

macro_rules! test_case {
    ($name:ident, $config: expr, $input_files: expr, $output_files: expr) => {
        #[test]
        fn $name() {
            let config = $config;

            let mut graph = Graph::new();
            let files = MockFS::new(HashMap::from($input_files));

            block_on(graph.load("/entry.pc", &files));
            let graph = Rc::new(graph);

            let project = Project {
                config: Rc::new(config.clone()),
                graph: graph.clone(),
                directory: "/".to_string(),
                compiler: ProjectCompiler::load(config, graph.clone(), "/".to_string()),
            };

            if let Ok(all_files) = block_on(project.compile()) {
                let expected_files = HashMap::from($output_files);
                for (key, content) in all_files {
                  if let Some(expected_content) = expected_files.get(key.as_str()) {
                    assert_eq!(
                        strip_extra_ws(content.as_str()),
                        strip_extra_ws(expected_content)
                    )
                  }
                }
            } else {
                panic!("Parse error");
            }

            ()
        }
    };
}

fn default_config_with_compiler_options(options: Vec<CompilerOptions>) -> Config {
    Config {
        src_dir: Some(".".to_string()),
        global_css: None,
        module_dirs: None,
        compiler_options: Some(options),
    }
}

fn default_compiler_options_with_emit(emit: Vec<String>) -> CompilerOptions {
    CompilerOptions {
        target: None,
        emit: Some(emit),
        out_dir: None,
        import_assets_as_modules: None,
        main_css_file_name: None,
        embed_asset_max_size: None,
        asset_out_dir: None,
        asset_prefix: None,
        use_asset_hash_names: None,
    }
}

test_case! {
  can_compile_basic_css,
  default_config_with_compiler_options(vec![
    default_compiler_options_with_emit(vec!["css".to_string()])
  ]),
  [
    ("/entry.pc", r#"
      div {
        style {
          color: red
        }
      }
    "#)
  ],
  [
    ("/entry.pc.css", r#"
    .80f4925f-4 { color: red; }
    "#)
  ]
}


test_case! {
  can_compile_basic_html,
  default_config_with_compiler_options(vec![
    default_compiler_options_with_emit(vec!["html".to_string()])
  ]),
  [
    ("/entry.pc", r#"
      div {
        text "Hello world"
      }
    "#)
  ],
  [
    ("/entry.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" src="/entry.pc.css">
        </head>
        <body>
          <div> Hello world </div>
        </body>
      </html>
    "#)
  ]
}

test_case! {
  includes_css_from_other_imported_files,
  default_config_with_compiler_options(vec![
    default_compiler_options_with_emit(vec!["css".to_string(), "html".to_string()])
  ]),
  [
    ("/entry.pc", r#"
      import "/imp.pc" as imp0
      div {
        text "Hello world"
      }
    "#),
    ("/imp.pc", r#"
      text abba "hello" {
        style {
          color: blue
        }
      }
    "#)
  ],
  [
    ("/entry.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" src="/entry.pc.css">
          <link rel="stylesheet" src="/imp.pc.css">
        </head>
        <body>
          <div> Hello world </div>
        </body>
      </html>
    "#),
    ("/imp.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" src="/imp.pc.css">
        </head>
        <body>
          <span class="abba-f7127f1d"> hello </span>
        </body>
      </html>
    "#),
    ("/imp.pc.css", r#"
    .abba-f7127f1d { color: blue; }
  "#)
  ]
}


test_case! {
  wraps_html_and_css_classes_with_component_names,
  default_config_with_compiler_options(vec![
    default_compiler_options_with_emit(vec!["css".to_string(), "html".to_string()])
  ]),
  [
    ("/entry.pc", r#"
      component A {
        render div b {
          style {
            color: blue
          }
          slot children
        }
      }

      A {
        text "Hello world"
      }
    "#)
  ],
  [
    ("/entry.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" src="/entry.pc.css">
        </head>
        <body>
          <div class="A-b-80f4925f"> Hello world </div>
        </body>
      </html>
    "#),
    ("/entry.pc.css", r#"
      .A-b-80f4925f { color: blue; }
    "#)
  ]
}
