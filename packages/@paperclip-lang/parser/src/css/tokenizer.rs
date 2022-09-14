use crate::base::tokenizer::next_scanner_char;
use crate::core::errors as err;
use crate::core::string_scanner::{
    is_az, is_digit, is_newline, is_space, scan_number, scan_string, Char, StringScanner,
};
use std::str;

#[derive(Debug, PartialEq, Clone)]
pub enum Token<'src> {
    CurlyOpen,
    CurlyClose,
    ParenOpen,
    Percent,
    ParenClose,
    Minus,
    Plus,
    Backslash,
    Star,
    Hash,
    Colon,
    Period,
    Comma,
    Byte(u8),
    Number(f32),
    Keyword(&'src [u8]),
    HexColor(&'src [u8]),
    Newline(&'src [u8]),
    Space(&'src [u8]),
    String(&'src [u8]),
    Cluster(&'src [u8]),
}

pub fn next_token<'src>(
    scanner: &mut StringScanner<'src>,
) -> Result<Token<'src>, err::ParserError> {
    let s_pos = scanner.pos;
    let c = next_scanner_char(scanner)?;

    Ok(match c {
        Char::Byte(b) => match b {
            b'{' => Token::CurlyOpen,
            b'}' => Token::CurlyClose,
            b'(' => Token::ParenOpen,
            b')' => Token::ParenClose,
            b'%' => Token::Percent,
            b',' => Token::Comma,
            b':' => Token::Colon,
            b'.' => Token::Period,
            b'*' => Token::Star,
            b'/' => Token::Backslash,
            b'+' => Token::Plus,
            b'#' => Token::HexColor(
                &scanner.source[(s_pos + 1)..scanner.scan(is_hex_color_part).u8_pos],
            ),
            b'\"' | b'\'' => Token::String(scan_string(scanner, b)),
            _ if is_az(b) => {
                let e_pos = scanner.scan(is_keyword_part).u8_pos;
                Token::Keyword(&scanner.source[s_pos..e_pos])
            }
            b'-' => {
                if let Some(b) = scanner.peek(0) {
                    if is_digit(b) {
                        Token::Number(scan_number2(scanner, s_pos))
                    } else if is_keyword_part(b) {
                        let e_pos = scanner.scan(is_keyword_part).u8_pos;
                        Token::Keyword(&scanner.source[s_pos..e_pos])
                    } else {
                        Token::Minus
                    }
                } else {
                    Token::Minus
                }
            }
            _ if is_digit(b) => Token::Number(scan_number2(scanner, s_pos)),
            _ if is_space(b) => Token::Space(&scanner.source[s_pos..scanner.scan(is_space).u8_pos]),
            _ if is_newline(b) => {
                Token::Newline(&scanner.source[s_pos..scanner.scan(is_newline).u8_pos])
            }
            _ => Token::Byte(b),
        },
        Char::Cluster(cluster) => Token::Cluster(cluster),
    })
}

fn scan_number2<'src>(scanner: &mut StringScanner<'src>, s_pos: usize) -> f32 {
    let buffer = str::from_utf8(scan_number(scanner, s_pos)).unwrap();
    buffer.parse::<f32>().unwrap()
}

fn is_hex_color_part(b: u8) -> bool {
    is_digit(b) || is_az(b)
}

fn is_keyword_part(b: u8) -> bool {
    b == b'-' || is_az(b) || is_digit(b)
}

pub fn is_superfluous(token: &Token) -> bool {
    matches!(token, Token::Space(_))
}
pub fn is_superfluous_or_newline(token: &Token) -> bool {
    matches!(token, Token::Space(_) | Token::Newline(_))
}

#[cfg(test)]
mod tests {

    #[test]
    fn can_tokenize_style_declaration() {
        // let mut scanner = StringScanner::new("/**@a(blah:\"abba\") \n\n*/");
    }
}
