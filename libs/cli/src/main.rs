// https://github.com/clap-rs/clap/blob/495e49e1a70989f4c8904c355f90d6149f673ce2/examples/git-derive.rs
// https://paperclip.dev/docs/usage-cli

mod commands;
use clap::{Parser, Subcommand};
use commands::build::{build, BuildArgs};
use commands::designer::{start_design_server, StartDesignServerArgs};
use commands::init::{init, InitArgs};
use futures::executor::block_on;

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
}

fn main() {
    let args = Args::parse();

    match args.command {
        Command::Build(args) => block_on(build(args)).expect("Build error"),
        Command::Init(args) => block_on(init(args)).expect("Build error"),
        Command::Designer(args) => {
            block_on(start_design_server(args)).expect("Can't start the design server")
        }
    };
}

#[cfg(test)]
pub mod tests;
