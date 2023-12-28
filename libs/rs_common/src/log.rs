use colored::Colorize;

fn is_log_level_enabled(value: &str) -> bool {
    std::env::var("PC_LOG_LEVEL")
        .unwrap_or("NOTICE".to_string())
        .split("|")
        .map(|v| v.to_string())
        .collect::<Vec<String>>()
        .contains(&value.to_string())
}

pub fn verbose(message: &str) {
    if is_log_level_enabled("VERBOSE") || is_log_level_enabled("ALL") {
        println!("{}", message.dimmed());
    }
}

pub fn notice(message: &str) {
    println!("{}", message);
}

pub fn warning(message: &str) {
    println!("{}", message.bright_yellow());
}
