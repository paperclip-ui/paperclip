use anyhow::{Error, Result};
use clap::Args;
use paperclip_config::ConfigContext;
use paperclip_project::LocalIO;
use paperclip_workspace::server::io::LocalServerIO;
use paperclip_workspace::server::server::{start, StartOptions};

use std::env;

#[derive(Debug, Args)]
pub struct StartDesignServerArgs {
    /// Open the designer
    #[clap(short, long, value_parser, default_value_t = false)]
    open: bool,

    /// Take component screenshots for the designer
    #[clap(short, long, parse(try_from_str), default_value = "true")]
    screenshots: bool,

    /// Port for the design server to listen on
    #[clap(short, long, value_parser)]
    port: Option<u16>,

    /// Port for the design server to listen on
    #[clap(short, long, value_parser)]
    config: Option<String>,
}

pub async fn start_design_server(args: StartDesignServerArgs) -> Result<()> {
    let project_io = LocalIO::default();

    let config_context = ConfigContext::load(
        env::current_dir()?.display().to_string().as_str(),
        args.config.clone(),
        &project_io,
    )?;

    if let Err(_) = start(
        StartOptions {
            config_context,
            port: args.port,
            open: args.open,
            component_screenshots: args.screenshots,
        },
        LocalServerIO::default(),
    ) {
        Err(Error::msg("Can't start design server"))
    } else {
        Ok(())
    }
}
