use paperclip_config::{CompilerOptions, Config};
use std::fs::File;
use std::path::Path;
use std::{env, io::Write};

use anyhow::Result;
use clap::Args;
use console::style;

#[derive(Debug, Args)]
pub struct InitArgs {}

pub async fn init(_args: InitArgs) -> Result<()> {
    let current_dir = String::from(env::current_dir()?.to_str().unwrap());
    let config_name = "paperclip.config.json";

    let info = format!(
        "
      Creating a new {} file.
    ",
        style(config_name).bold()
    );

    println!("{}", textwrap::dedent(&info));

    let new_config = Config {
        experimental: None,
        src_dir: Some("src".to_string()),
        designs_dir: Some("src/designs".to_string()),
        global_scripts: None,
        module_dirs: None,
        open_code_editor_command_template: None,
        compiler_options: Some(vec![CompilerOptions {
            emit: Some(vec!["css".to_string(), "react.js:js".to_string()]),
            out_dir: Some("lib".to_string()),
            import_assets_as_modules: None,
            // main_css_file_name: Some("main.css".to_string()),
            main_css_file_name: None,
            embed_asset_max_size: None,
            // asset_out_dir: Some("assets".to_string()),
            asset_out_dir: None,
            asset_prefix: None,
            use_asset_hash_names: None,
        }]),
    };

    let config_content =
        serde_json::to_string_pretty(&new_config).expect("Couldn't serialize JSON");

    let config_path = Path::new(&current_dir).join(config_name);

    File::create(config_path)
        .expect("Coudn't create JSON file")
        .write_all(config_content.as_bytes())
        .expect("Couldn't write JSON file");

    println!(
        "You can learn more at {}",
        style("https://paperclip.dev/docs/configure-paperclip").bold()
    );
    Ok(())
}
