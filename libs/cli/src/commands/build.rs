use anyhow::Result;
use clap::Args;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::LocalFileReader;
use paperclip_config::{ConfigContext, DEFAULT_CONFIG_NAME};
use paperclip_project::{CompileOptions, LocalIO, Project};
use paperclip_validate::print::PrettyPrint;
use std::env;
use std::fs::File;
use std::io::prelude::*;

#[derive(Debug, Args)]
pub struct BuildArgs {
    /// Prints the compiled output
    #[clap(short, long, value_parser, default_value_t = false)]
    print: bool,

    /// Starts the file watcher
    #[clap(short, long, value_parser, default_value_t = false)]
    watch: bool,

    /// The config file to use for compiling
    #[clap(short, long, default_value_t = String::from(DEFAULT_CONFIG_NAME))]
    config: String,
}

pub async fn build(args: BuildArgs) -> Result<()> {
    let current_dir = String::from(env::current_dir()?.to_str().unwrap());
    let fr = LocalFileReader::default();
    let config_context = ConfigContext::load(&current_dir, Some(args.config), &fr)?;
    let io = LocalIO::new(config_context.clone());

    let mut project = Project::new(config_context, io.clone());

    project.load_all_files().await?;

    let s = project.compile_all(CompileOptions { watch: args.watch });
    pin_mut!(s);
    while let Some(result) = s.next().await {
        if let Ok((path, content)) = result {
            // replace cd with relative since it's a prettier output
            println!("✍🏻  {}", path.replace(&format!("{}/", current_dir), ""));
            if args.print {
                println!("{}", content);
            } else {
                let mut file = File::create(path)?;
                file.write_all(content.as_str().as_bytes())?;
            }
        } else if let Err(err) = result {
            let pretty =
                PrettyPrint::from_notice(&err, &current_dir, &io).expect("Cannot pretty print");
            println!("{}", pretty.to_string());
        }
    }

    Ok(())
}
