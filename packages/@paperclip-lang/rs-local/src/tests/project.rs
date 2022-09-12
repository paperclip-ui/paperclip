use crate::config::{CompilerOptions, Config};
use crate::project::{CompileOptions, Project};
use crate::project_compiler::ProjectCompiler;
use crate::project_io::ProjectIO;
use futures::executor::block_on;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::graph::Graph;
use paperclip_parser::graph::io::IO as GraphIO;
use paperclip_parser::graph::test_utils::MockFS;
use path_absolutize::*;
use std::collections::HashMap;
use std::path::Path;
use std::rc::Rc;

struct MockIO;
impl GraphIO for MockIO {}
impl ProjectIO for MockIO {}

impl FileReader for MockIO {
    fn read_file(&self, path: &str) -> Option<Box<[u8]>> {
        Some(path.to_string().as_bytes().to_vec().into_boxed_slice())
    }
}

impl FileResolver for MockIO {
    fn resolve_file(&self, from_path: &str, to_path: &str) -> Option<String> {
        let resolved_path = String::from(
            Path::new(from_path)
                .parent()
                .unwrap()
                .join(to_path)
                .absolutize()
                .unwrap()
                .to_str()
                .unwrap(),
        );

        Some(resolved_path)
    }
}

macro_rules! test_case {
    ($name:ident, $config: expr, $dir: expr, $main: expr, $input_files: expr, $output_files: expr) => {
        #[test]
        fn $name() {
            let config = Rc::new($config);

            let mut graph = Graph::new();
            let files = MockFS::new(HashMap::from($input_files));

            block_on(graph.load($main, &files));
            let graph = Rc::new(graph);
            let io = Rc::new(MockIO {});

            let project = Project {
                io: io.clone(),
                config: config.clone(),
                graph: graph.clone(),
                directory: $dir.to_string(),
                compiler: ProjectCompiler::load(config.clone(), $dir.to_string(), io.clone()),
            };

            if let Ok(all_files) = block_on(project.compile(CompileOptions { watch: false })) {
                let expected_files = HashMap::from($output_files);
                for (key, content) in all_files {
                    if let Some(expected_content) = expected_files.get(key.as_str()) {
                        assert_eq!(
                            strip_extra_ws(content.as_str()),
                            strip_extra_ws(expected_content)
                        )
                    } else {
                        panic!("File {} not handled", key);
                    }
                }
            } else {
                panic!("Parse error");
            }

            ()
        }
    };
}

fn default_config_with_compiler_options(src: &str, options: Vec<CompilerOptions>) -> Config {
    Config {
        src_dir: Some(src.to_string()),
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
  default_config_with_compiler_options(".", vec![
    default_compiler_options_with_emit(vec!["css".to_string()])
  ]),
  "/",
  "/entry.pc",
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
  default_config_with_compiler_options(".", vec![
    default_compiler_options_with_emit(vec!["html".to_string()])
  ]),
  "/",
  "/entry.pc",
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
          <link rel="stylesheet" href="/entry.pc.css">
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
  default_config_with_compiler_options(".", vec![
    default_compiler_options_with_emit(vec!["css".to_string(), "html".to_string()])
  ]),
  "/",
  "/entry.pc",
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
          <link rel="stylesheet" href="/entry.pc.css">
          <link rel="stylesheet" href="/imp.pc.css">
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
          <link rel="stylesheet" href="/imp.pc.css">
        </head>
        <body>
          <span class="abba-f7127f1d"> hello </span>
        </body>
      </html>
    "#),
    ("/imp.pc.css", r#"
    .abba-f7127f1d { color: blue; }
  "#),
  ("/entry.pc.css", r#"
"#)
  ]
}

test_case! {
  wraps_html_and_css_classes_with_component_names,
  default_config_with_compiler_options("src", vec![
    default_compiler_options_with_emit(vec!["css".to_string(), "html".to_string()])
  ]),
  "/",
  "/entry.pc",
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
          <link rel="stylesheet" href="/entry.pc.css">
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

test_case! {
  can_emit_one_global_css_file,
  default_config_with_compiler_options("src", vec![
    CompilerOptions {
      target: None,
      emit: Some(vec!["css".to_string(), "html".to_string()]),
      out_dir: Some("out/".to_string()),
      import_assets_as_modules: None,
      main_css_file_name: Some("main.css".to_string()),
      embed_asset_max_size: None,
      asset_out_dir: Some("assets".to_string()),
      asset_prefix: None,
      use_asset_hash_names: None,
  }
  ]),
  "/project",
  "/project/src/entry.pc",
  [
    ("/project/src/entry.pc", r#"
      import "/project/src/imp.pc" as imp0
      div {
        style {
          color: blue
        }
        text "A"
      }
    "#),
    ("/project/src/imp.pc", r#"
      div {
        style {
          color: orange
        }
        text "B"
      }
  "#)
  ],
  [
    ("/project/out/entry.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" href="/project/out/assets/main.css">
        </head>
        <body>
          <div class="856b6f45-6"> A </div>
        </body>
      </html>
    "#),
    ("/project/out/imp.pc.html", r#"
      <!doctype html>
      <html> 
        <head>
          <link rel="stylesheet" href="/project/out/assets/main.css">
        </head>
        <body>
          <div class="e2ff1d5b-5"> B </div>
        </body>
      </html>
    "#),
    ("/project/out/assets/main.css", r#"
    /* /project/out/entry.pc.css */ 
    .856b6f45-6 { color: blue; }
    /* /project/out/imp.pc.css */ 
    .e2ff1d5b-5 { color: orange; } 
    "#)
  ]
}

test_case! {
  properly_resolves_css_assets,
  default_config_with_compiler_options("src", vec![
    CompilerOptions {
      target: None,
      emit: Some(vec!["css".to_string()]),
      out_dir: Some("out/".to_string()),
      import_assets_as_modules: None,
      main_css_file_name: Some("main.css".to_string()),
      embed_asset_max_size: None,
      asset_out_dir: None,
      asset_prefix: None,
      use_asset_hash_names: None,
  }
  ]),
  "/project",
  "/project/src/entry.pc",
  [
    ("/project/src/entry.pc", r#"
      import "/project/src/imp.pc" as imp0
      div {
        style {
          background: url("../image.png")
        }
        text "A"
      }
    "#)
  ],
  [
    ("/project/out/assets/main.css", r#"
    /* /project/out/entry.pc.css */
     .856b6f45-7 { background: url("/project/image.png"); }
    "#)
  ]
}

test_case! {
  moves_assets_to_asset_out_dir_if_present,
  default_config_with_compiler_options("src", vec![
    CompilerOptions {
      target: None,
      emit: Some(vec!["css".to_string()]),
      out_dir: Some("out/".to_string()),
      import_assets_as_modules: None,
      main_css_file_name: Some("main.css".to_string()),
      embed_asset_max_size: None,
      asset_out_dir: Some("assets".to_string()),
      asset_prefix: None,
      use_asset_hash_names: None,
  }
  ]),
  "/project",
  "/project/src/entry.pc",
  [
    ("/project/src/entry.pc", r#"
      import "/project/src/imp.pc" as imp0
      div {
        style {
          background: url("./image.png")
        }
        text "A"
      }
    "#)
  ],
  [
    ("/project/out/assets/main.css", r#"
    /* /project/out/entry.pc.css */
     .856b6f45-7 { background: url("/project/out/assets/image.png"); }
    "#)
  ]
}
