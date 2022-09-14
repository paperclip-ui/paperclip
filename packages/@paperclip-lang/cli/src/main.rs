// https://github.com/clap-rs/clap/blob/495e49e1a70989f4c8904c355f90d6149f673ce2/examples/git-derive.rs
// https://paperclip.dev/docs/usage-cli

mod commands;
use clap::{Parser, Subcommand};
use commands::build::{build, BuildArgs};
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
    Init {},

    /// Starts the visual development tooling
    #[clap(arg_required_else_help = false)]
    Dev {},
}

fn main() {
    let args = Args::parse();

    match args.command {
        Command::Build(args) => {
            if let Err(_) = block_on(build(args)) {
                println!("build error!")
            }
        }
        Command::Init {} => {}
        Command::Dev {} => {}
    };
}

#[cfg(test)]
pub mod tests;
