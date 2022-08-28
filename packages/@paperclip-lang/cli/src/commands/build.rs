use anyhow::Result;
use clap::Args;
use paperclip_local::config::DEFAULT_CONFIG_NAME;
use paperclip_local::project::Project;
use std::env;

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
    ).await;


    // project.compile
    

    // println!("BUILD IT {:?}", args);
    Ok(())
}
