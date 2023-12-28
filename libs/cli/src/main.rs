// https://github.com/clap-rs/clap/blob/495e49e1a70989f4c8904c355f90d6149f673ce2/examples/git-derive.rs
// https://paperclip.dev/docs/usage-cli

mod commands;
use clap::{Parser, Subcommand};
use commands::build::{build, BuildArgs};
use commands::designer::{start_design_server, StartDesignServerArgs};
use commands::fmt::{fmt, FmtArgs};
use commands::init::{init, InitArgs};
use futures::executor::block_on;
use paperclip_validate::print::ToPrettyString;

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    #[clap(subcommand)]
    command: Command,
}

#[derive(Subcommand, Debug)]
enum Command {
    /// Builds a paperclip project
    #[clap(arg_required_else_help = false)]
    Build(BuildArgs),

    /// Configures Paperclip with your current project & installs compilers.
    #[clap(arg_required_else_help = false)]
    Init(InitArgs),

    /// Starts the visual development tooling
    #[clap(arg_required_else_help = false)]
    Designer(StartDesignServerArgs),

    /// Formats all PC files
    #[clap(arg_required_else_help = false)]
    Fmt(FmtArgs),
}

fn main() {
    let args = Args::parse();

    let cwd = std::env::current_dir()
        .expect("Can't get current dir")
        .display()
        .to_string();

    let result = match args.command {
        Command::Build(args) => block_on(build(args, &cwd)),
        Command::Init(args) => block_on(init(args, &cwd)),
        Command::Fmt(args) => block_on(fmt(args, &cwd)),
        Command::Designer(args) => block_on(start_design_server(args, &cwd)),
    };

    if let Err(err) = result {
        println!("{}", err.to_pretty_string());
    }
}

#[cfg(test)]
pub mod tests;
