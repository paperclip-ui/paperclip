use super::ast::U16Position;
use super::string_scanner::StringScanner;

pub fn get_integer<'a>(scanner: &mut StringScanner<'a>) -> &'a [u8] {
    scanner.search(|c| matches!(c, b'0'..=b'9'))
}
