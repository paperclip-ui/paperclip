// https://github.com/clap-rs/clap/blob/495e49e1a70989f4c8904c355f90d6149f673ce2/examples/git-derive.rs
// https://paperclip.dev/docs/usage-cli

mod commands;
use clap::{Parser, Subcommand};
use commands::build::{BuildArgs, build};


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
            build(args);
        }
        Command::Init {} => {}
        Command::Dev {} => {}
    };

    // for _ in 0..args.count {
    //     println!("Hello {}!", args.name)
    // }
}

#[cfg(test)]
pub mod tests;
