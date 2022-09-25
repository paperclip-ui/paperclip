use dialoguer::{theme::ColorfulTheme, Input};
use paperclip_project::config::{CompilerOptions, Config};
use std::fs::File;
use std::path::Path;
use std::{env, io::Write};

use anyhow::Result;
use clap::Args;
use console::style;

#[derive(Debug, Args)]
pub struct InitArgs {}

pub async fn init(args: InitArgs) -> Result<()> {
    let current_dir = String::from(env::current_dir()?.to_str().unwrap());
    let CONFIG_NAME = "paperclip.config2.json";

    let info = format!(
        "
      Creating a new {} file.
    ",
        style(CONFIG_NAME).bold()
    );

    println!("{}", textwrap::dedent(&info));

    let src_name: String = Input::with_theme(&ColorfulTheme::default())
        .with_prompt("Where should Paperclip files go?")
        .default("src".into())
        .interact_text()
        .unwrap();

    let new_config = Config {
        src_dir: Some(src_name),
        global_css: None,
        module_dirs: None,
        compiler_options: Some(vec![CompilerOptions {
            emit: Some(vec!["css".to_string()]),
            out_dir: None,
            import_assets_as_modules: None,
            main_css_file_name: None,
            embed_asset_max_size: None,
            asset_out_dir: None,
            asset_prefix: None,
            use_asset_hash_names: None,
        }]),
    };

    let config_content =
        serde_json::to_string_pretty(&new_config).expect("Couldn't serialize JSON");

    let config_path = Path::new(&current_dir).join(CONFIG_NAME);

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
