use clap::Args;

#[derive(Debug, Args)]
pub struct BuildArgs {
    /// Prints the compiled output
    #[clap(short, long, value_parser, default_value_t = true)]
    print: bool,

    /// Starts the file watcher
    #[clap(short, long, value_parser, default_value_t = false)]
    watch: bool,

    /// The config file to use for compiling
    #[clap(short, long)]
    config: Option<String>,
}

pub fn build(args: BuildArgs) {
  println!("BUILD IT");
}