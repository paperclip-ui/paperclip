use anyhow::Result;
use clap::Args;
use paperclip_common::fs::LocalFileReader;
use paperclip_core::config::ConfigContext;
use paperclip_proto::notice::base::{Notice, NoticeList};
use paperclip_workspace::server::io::LocalServerIO;
use paperclip_workspace::server::server::{start, StartOptions};

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

pub async fn start_design_server(args: StartDesignServerArgs, cwd: &str) -> Result<(), NoticeList> {
    let config_context =
        ConfigContext::load(cwd, args.config.clone(), &LocalFileReader::default())?;
    if let Err(_) = start(
        StartOptions {
            config_context: config_context.clone(),
            port: args.port,
            open: args.open,
            component_screenshots: args.screenshots,
        },
        LocalServerIO::new(config_context.clone()),
    ) {
        Err(Notice::unexpected("Unable to start server", None).to_list())
    } else {
        Ok(())
    }
}
