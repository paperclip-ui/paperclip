use anyhow::{Error, Result};
use clap::Args;
use paperclip_config::ConfigContext;
use paperclip_designer::server::io::LocalServerIO;
use paperclip_designer::server::server::{start, StartOptions};
use paperclip_project::LocalIO;

use std::env;

#[derive(Debug, Args)]
pub struct StartDesignServerArgs {
    /// Open the designer
    #[clap(short, long, value_parser, default_value_t = false)]
    open: bool,

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
        },
        LocalServerIO::default(),
    ) {
        Err(Error::msg("Can't start design server"))
    } else {
        Ok(())
    }
}
