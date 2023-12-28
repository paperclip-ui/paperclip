use anyhow::Result;
use clap::Args;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::LocalFileReader;
use paperclip_config::{ConfigContext, DEFAULT_CONFIG_NAME};
use paperclip_project::{CompileOptions, LocalIO, Project};
use paperclip_proto::notice::base::NoticeList;
use paperclip_validate::print::ToPrettyString;
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

pub async fn build(args: BuildArgs, cwd: &str) -> Result<(), NoticeList> {
    let fr = LocalFileReader::default();
    let config_context = ConfigContext::load(&cwd, Some(args.config), &fr)?;
    let io = LocalIO::new(config_context.clone());

    let mut project = Project::new(config_context, io.clone());

    project.load_all_files().await;

    let s = project.compile_all(CompileOptions { watch: args.watch });
    pin_mut!(s);
    while let Some(result) = s.next().await {
        if let Ok((path, content)) = result {
            // replace cd with relative since it's a prettier output
            println!("✍🏻  {}", path.replace(&format!("{}/", cwd), ""));
            if args.print {
                println!("{}", content);
            } else {
                let mut file = File::create(path).expect("Unable to create path");
                file.write_all(content.as_str().as_bytes())
                    .expect("Unable to write contents");
            }
        } else if let Err(err) = result {
            println!("{}", err.to_pretty_string());
        }
    }

    Ok(())
}
