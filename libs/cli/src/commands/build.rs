use anyhow::Result;
use clap::Args;
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use paperclip_common::fs::LocalFileReader;
use paperclip_common::log::{notice, verbose};
use paperclip_core::config::{ConfigContext, DEFAULT_CONFIG_NAME};
use paperclip_project::{CompileOptions, LocalIO, Project};
use paperclip_proto::notice::base::NoticeList;
use paperclip_validate::print::ToPrettyString;
use std::fs;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

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

    if !config_context.get_src_dir().exists() {
        verbose("Src dir doesn't exist");
        return Ok(());
    }

    let mut project = Project::new(config_context, io.clone());

    // skip error capturing since the REST of the stuff below will
    // run into the same errors
    let load_files_result = project.load_all_files().await;

    if let Err(err) = &load_files_result {
        notice(&format!("{}", err.to_pretty_string()));
    }

    let s = project.compile_all(CompileOptions {
        watch: args.watch,
        initial: load_files_result.is_ok(),
    });
    pin_mut!(s);
    while let Some(result) = s.next().await {
        if let Ok((path, content)) = result {
            // replace cd with relative since it's a prettier output
            notice(&format!("✍🏻  {}", path.replace(&format!("{}/", cwd), "")));
            if args.print {
                println!("{}", content);
            } else {
                let dir = Path::new(&path).parent().unwrap();
                let _ = fs::create_dir_all(dir.to_str().unwrap());

                let mut file = File::create(path).expect("Unable to create path");
                file.write_all(content.as_str().as_bytes())
                    .expect("Unable to write contents");
            }
        } else if let Err(err) = result {
            notice(&format!("{}", err.to_pretty_string()));
        }
    }

    Ok(())
}
