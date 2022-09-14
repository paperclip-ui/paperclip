#[macro_export]
macro_rules! get_or_short {
    ($pat: expr, $short: expr) => {{
        if let Some(value) = $pat {
            value
        } else {
            return $short;
        }
    }};
}
