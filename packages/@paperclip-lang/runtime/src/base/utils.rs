use regex::Regex;

pub fn strip_extra_ws(value: &str) -> String {
    lazy_static! {
        static ref WS_RE: Regex = Regex::new(r#"[\n\r\s]+"#).unwrap();
    }
    WS_RE.replace_all(value, " ").trim().to_string()
}
