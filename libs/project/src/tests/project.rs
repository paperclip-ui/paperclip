use crate::config::{CompilerOptions, Config, ConfigContext};
use crate::io::{ProjectIO, WatchEvent, WatchEventKind};
use crate::{CompileOptions, Project};
use anyhow::Result;
use async_stream::stream;
use futures::executor::block_on;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::{FileReader, FileResolver};
use paperclip_common::str_utils::strip_extra_ws;
use paperclip_parser::graph::io::IO as GraphIO;
use paperclip_parser::graph::test_utils::MockFS;
use path_absolutize::*;
use std::collections::HashMap;
use std::path::Path;

#[derive(Clone)]
struct MockIO(MockFS<'static>);

impl GraphIO for MockIO {}

impl ProjectIO for MockIO {
    type Str = impl Stream<Item = WatchEvent>;
    fn watch(&self, _dir: &str) -> Self::Str {
        stream! {
          yield WatchEvent::new(WatchEventKind::Create, &"nada".to_string());
        }
    }
    fn get_all_designer_files(&self, _context: &ConfigContext) -> Vec<String> {
        vec![]
    }
}

impl FileReader for MockIO {
    fn read_file(&self, path: &str) -> Result<Box<[u8]>> {
        self.0.read_file(path)
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
            let config_context = ConfigContext {
                directory: $dir.to_string(),
                file_name: "paperclip.config.json".to_string(),
                config: $config,
            };

            let io = MockIO(MockFS::new(HashMap::from($input_files)));

            let mut project = Project::new(config_context, io.clone());

            let result = block_on(project.load_file($main));
            if let Err(error) = result {
                panic!("{:?}", error);
            }

            let output = project.compile_all(CompileOptions { watch: false });

            pin_mut!(output);
            let expected_files = HashMap::from($output_files);

            while let Some(result) = block_on(output.next()) {
                if let Ok((key, content)) = result {
                    if let Some(expected_content) = expected_files.get(key.as_str()) {
                        assert_eq!(
                            strip_extra_ws(content.as_str()),
                            strip_extra_ws(expected_content)
                        )
                    } else {
                        panic!("File {} not handled", key);
                    }
                } else {
                    panic!("Parse error");
                }
            }

            // if let Ok(all_files) = block_on() {
            //     let expected_files = HashMap::from($output_files);
            //     for (key, content) in all_files {

            //     }
            // } else {
            //     panic!("Parse error");
            // }

            // ()
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
    ._80f4925f-4 { color: red; }
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
          <span class="_abba-f7127f1d-4"> hello </span>
        </body>
      </html>
    "#),
    ("/imp.pc.css", r#"
    ._abba-f7127f1d-4 { color: blue; }
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
          <div class="_A-b-80f4925f-5"> Hello world </div>
        </body>
      </html>
    "#),
    ("/entry.pc.css", r#"
      ._A-b-80f4925f-5 { color: blue; }
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
          <div class="_856b6f45-6"> A </div>
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
          <div class="_e2ff1d5b-5"> B </div>
        </body>
      </html>
    "#),
    ("/project/out/assets/main.css", r#"
    /* /project/out/entry.pc.css */ 
    ._856b6f45-6 { color: blue; }
    /* /project/out/imp.pc.css */ 
    ._e2ff1d5b-5 { color: orange; } 
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
     ._856b6f45-7 { background: url("/project/image.png"); }
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
     ._856b6f45-6 { background: url("/project/out/assets/image.png"); }
    "#)
  ]
}

test_case! {
  all_css_imports_are_included,
  default_config_with_compiler_options("src", vec![
    default_compiler_options_with_emit(vec!["css".to_string(), "html".to_string()])
  ]),
  "/",
  "/entry.pc",
  [
    ("/entry.pc", r#"
      import "/test.pc" as test
      
      test.Component
    "#),

    ("/test.pc", r#"
      import "/colors.pc" as colors
      
      public component Component {
        render div {
          style {
            background: var(colors.white0)
          }
        }
      }
    "#),

    ("/colors.pc", r#"
      public token white0 #FFF
    "#),

  ],
  [
    ("/entry.pc.css", ""),
    ("/entry.pc.html", r#"
      <!doctype html> 
      <html>
        <head> 
          <link rel="stylesheet" href="/entry.pc.css"> 
          <link rel="stylesheet" href="/test.pc.css">
          <link rel="stylesheet" href="/colors.pc.css">
        </head> 
        <body> 
          <div class="_Component-6bcf0994-6">
          </div> 
        </body> 
      </html>
    "#),
    ("/colors.pc.css", ":root { --e05e7926-2: #FFF; }"),
    ("/colors.pc.html", r#"
      <!doctype html> 
      <html> 
        <head> 
          <link rel="stylesheet" href="/colors.pc.css">
        </head> 
        <body>
        </body>
      </html>
    "#),
    ("/test.pc.css", "._Component-6bcf0994-6 { background: var(--e05e7926-2); }"),
    ("/test.pc.html", r#"
      <!doctype html> 
      <html> 
        <head> 
          <link rel="stylesheet" href="/test.pc.css">
          <link rel="stylesheet" href="/colors.pc.css">
        </head> 
        <body>
        </body> 
      </html>
    "#)
  ]
}

test_case! {
  can_emit_a_custom_extension,
  default_config_with_compiler_options(".", vec![
    default_compiler_options_with_emit(vec!["html:html2".to_string()])
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
    ("/entry.pc.html2", r#"
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
