use crate::config::{Config, CompilerOptions};
use crate::project_compiler::ProjectCompiler;
use paperclip_parser::graph::graph::{Graph};
use paperclip_parser::graph::test_utils::MockFS;
use std::collections::HashMap;
use futures::executor::block_on;
use crate::project::Project;
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
        compiler: ProjectCompiler::load(config, graph.clone(), "/".to_string())
      };

      block_on(project.compile());

      panic!("SS");
    }
  };
}

fn default_config_with_compiler_options(options: Vec<CompilerOptions>) -> Config {
  Config {
    src_dir: Some(".".to_string()),
    global_css: None,
    module_dirs: None,
    compiler_options: Some(options)
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
    use_asset_hash_names: None
  }
}

test_case! {
  can_compile_css,
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
      
    "#)
  ]
}
