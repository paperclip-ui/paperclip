use anyhow::Result;
use paperclip_common::fs::FileReader;
use paperclip_project::io::LocalIO;
use paperclip_project::Project;

struct Loader {
    project: Project<LocalIO>,
}

impl Loader {
    // async fn init(directory: &str, config_name: &str) -> Result<Self> {
    //     Ok(Self {
    //         project: Project::load(directory, Some(config_name.to_string())).await?,
    //     })
    // }
    fn compile(content: &str, file_path: &str) {
        // TODO - return all emitted files
    }
}
