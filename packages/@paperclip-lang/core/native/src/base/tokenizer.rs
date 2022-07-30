use crate::core::errors as err;
use crate::core::string_scanner::{Char, StringScanner, StringScannerError};

pub fn next_scanner_char<'src>(
    scanner: &mut StringScanner<'src>,
) -> Result<Char<'src>, err::ParserError> {
    scanner.next_char().or_else(|err| match err {
        StringScannerError::EOF => Err(err::ParserError::new_eof()),
    })
}
