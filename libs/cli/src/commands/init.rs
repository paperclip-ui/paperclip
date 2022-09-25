use dialoguer::{theme::ColorfulTheme, Confirm};
use paperclip_project::config::{CompilerOptions, Config};
use std::fs::File;
use std::path::Path;
use std::thread::current;
use std::{env, io::Write};

use serde::{Deserialize, Serialize};

use anyhow::Result;
use clap::Args;

#[derive(Debug, Args)]
pub struct InitArgs {}

pub async fn init(args: InitArgs) -> Result<()> {
    let current_dir = String::from(env::current_dir()?.to_str().unwrap());

    if Confirm::with_theme(&ColorfulTheme::default())
        .with_prompt("Do you want to coninute?")
        .interact()
        .unwrap()
    {}

    let new_config = Config {
        src_dir: None,
        global_css: None,
        module_dirs: None,
        compiler_options: None,
    };

    let config_content =
        serde_json::to_string_pretty(&new_config).expect("Couldn't serialize JSON");

    let config_path = Path::new(&current_dir).join("paperclip.config2.json");

    File::create(config_path)
        .expect("Coudn't create JSON file")
        .write_all(config_content.as_bytes())
        .expect("Couldn't write JSON file");

    println!("INIT");
    Ok(())
}
