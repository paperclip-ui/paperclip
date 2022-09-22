use anyhow::{Error, Result};
use clap::Args;
use paperclip_design_server::{start, StartOptions};

#[derive(Debug, Args)]
pub struct StartDesignServerArgs {
    /// Open the designer
    #[clap(short, long, value_parser, default_value_t = false)]
    open: bool,

    /// Port for the design server to listen on
    #[clap(short, long, value_parser)]
    port: Option<u16>,
}

pub async fn start_design_server(args: StartDesignServerArgs) -> Result<()> {
    println!("{:?}", args);
    if let Err(_) = start(StartOptions {
        port: args.port,
        open: args.open,
    }) {
        Err(Error::msg("Can't start design server"))
    } else {
        Ok(())
    }
}
