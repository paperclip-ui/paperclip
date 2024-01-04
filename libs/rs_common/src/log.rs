use colored::Colorize;

fn is_log_level_enabled(value: &str) -> bool {
    std::env::var("PC_LOG_LEVEL")
        .unwrap_or("NOTICE".to_string())
        .split("|")
        .map(|v| v.to_string())
        .collect::<Vec<String>>()
        .contains(&value.to_string())
}

pub fn log_verbose(message: &str) {
    if is_log_level_enabled("VERBOSE") || is_log_level_enabled("ALL") {
        println!("{}", message.dimmed());
    }
}

pub fn log_notice(message: &str) {
    println!("{}", message);
}

pub fn log_warning(message: &str) {
    println!("{}", message.bright_yellow());
}
