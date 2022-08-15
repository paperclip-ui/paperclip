// https://github.com/clap-rs/clap/blob/495e49e1a70989f4c8904c355f90d6149f673ce2/examples/git-derive.rs
// https://paperclip.dev/docs/usage-cli

use clap::{Parser, Subcommand};

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
    Build {
        /// Prints the compiled output 
        #[clap(short, long, value_parser, default_value_t = true)]
        print: bool,

        /// Starts the file watcher
        #[clap(short, long, value_parser, default_value_t = false)]
        watch: bool,

        /// The config file to use for compiling
        #[clap(short, long)]
        config: Option<String>
    },

    /// Configures Paperclip with your current project & installs compilers.
    #[clap(arg_required_else_help = false)]
    Init {

    },

    /// Starts the visual development tooling
    #[clap(arg_required_else_help = false)]
    Dev {

    }
}


fn main() {
    let args = Args::parse();

    match args.command {
        Command::Build { print, watch, config } => {
            println!("DDDDDD");
        },
        Command::Init { } => {

        },
        Command::Dev {} => {

        }
    };

 
    // for _ in 0..args.count {
    //     println!("Hello {}!", args.name)
    // }
}

#[cfg(test)]
pub mod tests;
