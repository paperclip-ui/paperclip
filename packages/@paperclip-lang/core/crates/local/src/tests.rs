use crate::config::{CompilerOptions, Config};
use std::path::Path;

#[test]
fn can_load_a_simple_dependency_graph() {
    let config = Config::load(get_fixtures_dir("simple"), None).unwrap();
    assert_eq!(
        config,
        Config {
            src_dir: Some(".".to_string()),
            global_css: None,
            module_dirs: Some(vec!["node_modules".to_string()]),
            compiler_options: None
        }
    );
}

fn get_fixtures_dir(name: &str) -> String {
    String::from(
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("fixtures")
            .join(name)
            .to_str()
            .unwrap(),
    )
}
