use anyhow::Result;
use clap::Args;
use futures_core::stream::Stream;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_local::config::DEFAULT_CONFIG_NAME;
use paperclip_local::project::{CompileOptions, Project};
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
    let project = Project::load(
        &String::from(env::current_dir()?.to_str().unwrap()),
        Some(args.config),
    )
    .await?;

    let s = project.compile(CompileOptions { watch: args.watch });
    pin_mut!(s);
    while let Some(Ok((path, content))) = s.next().await {
        println!("✍🏻  {}", path);
        if args.print {
            println!("{}", content);
        } else {
            let mut file = File::create(path)?;
            file.write_all(content.as_str().as_bytes())?;
        }
    }

    Ok(())
}
