use anyhow::{Result, Error};
use clap::Args;
use paperclip_design_server::start;

#[derive(Debug, Args)]
pub struct StartDesignServerArgs {
}

pub async fn start_design_server(_args: StartDesignServerArgs) -> Result<()> {
  if let Err(_) = start() {
    Err(Error::msg("Can't start design server"))
  } else {
    Ok(())
  }
}
