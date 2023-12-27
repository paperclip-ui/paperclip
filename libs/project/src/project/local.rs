// use super::core::Project;
// use crate::config::ConfigContext;
// use crate::io::LocalIO;
// use anyhow::Result;
// use wax::Glob;

// impl Project<LocalIO> {
//     pub async fn load_local(directory: &str, config_file_name: Option<String>) -> Result<Self> {
//         let io = LocalIO {};

//         // first load the config in the CWD
//         let config_context = ConfigContext::load(directory, config_file_name, &io)?;

//         // next initialize the project which controls compilation and everything in between
//         let mut project = Project::new(config_context, io.clone());

//         let pattern = project
//             .get_config()
//             .get_relative_source_files_glob_pattern();
//         let glob = Glob::new(pattern.as_str()).unwrap();
//         let mut all_files: Vec<String> = vec![];

//         for entry in glob.walk(directory) {
//             let entry = entry.unwrap();
//             all_files.push(String::from(entry.path().to_str().unwrap()));
//         }

//         project.load_files(&all_files).await?;

//         Ok(project)
//     }
// }
