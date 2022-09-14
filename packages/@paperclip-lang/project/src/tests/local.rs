use crate::config::Config;
use crate::project::Project;
use futures::executor::block_on;
use std::path::Path;
use std::rc::Rc;

// #[test]
// fn can_load_a_simple_project() {
//     let directory = get_fixtures_dir("simple");
//     let project = block_on(Project::load(&directory, None)).unwrap();
//     assert_eq!(
//         project.config,
//         Rc::new(Config {
//             src_dir: Some(".".to_string()),
//             global_css: None,
//             module_dirs: Some(vec!["node_modules".to_string()]),
//             compiler_options: None
//         })
//     );
// }

// fn get_fixtures_dir(name: &str) -> String {
//     String::from(
//         Path::new(env!("CARGO_MANIFEST_DIR"))
//             .join("fixtures")
//             .join(name)
//             .to_str()
//             .unwrap(),
//     )
// }
