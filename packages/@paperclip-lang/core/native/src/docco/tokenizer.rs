use crate::base::tokenizer::next_scanner_char;
use crate::core::errors as err;
use std::str;
use crate::core::string_scanner::{
    is_az, is_newline, is_space, is_digit, scan_number, is_whitespace, scan_string, Char, StringScanner,
    StringScannerError,
};

#[derive(Debug, PartialEq, Clone)]
pub enum Token<'src> {
    CommentStart,
    CommentEnd,
    At,
    Word(&'src [u8]),
    ParenOpen,
    ParenClose,
    Colon,
    Comma,
    PropertyName(&'src [u8]),
    Whitespace(&'src [u8]),
    String(&'src [u8]),
    Number(f32),
    Byte(u8),
    Cluster(&'src [u8]),
}

pub fn next_token<'src>(
    scanner: &mut StringScanner<'src>,
) -> Result<Token<'src>, err::ParserError> {
    let s_pos = scanner.pos;
    let c = next_scanner_char(scanner)?;

    Ok(match c {
        Char::Byte(b) => match b {
            b'@' => Token::At,
            b'(' => Token::ParenOpen,
            b')' => Token::ParenClose,
            b':' => Token::Colon,
            b',' => Token::Comma,
            b'-' => {
                if let Some(b2) = scanner.peek(0) {
                    if is_digit(b2) {
                        Token::Number(scan_number2(scanner, s_pos))
                    } else {
                        Token::Byte(b'-')
                    }
                } else {
                    Token::Byte(b'-')
                }
            },
            b'*' => {
                if scanner.peek(0) == Some(b'/') {
                    scanner.forward(1);
                    Token::CommentEnd
                } else {
                    Token::Byte(b'*')
                }
            }
            b'/' => {
                if scanner.peek_some(2) == Some(b"**") {
                    scanner.forward(2);
                    Token::CommentStart
                } else {
                    Token::Byte(b'/')
                }
            }
            b'\"' | b'\'' => Token::String(scan_string(scanner, b)),
            _ if is_az(b) => {
                let e_pos = scanner.scan(is_az).u8_pos;
                Token::Word(&scanner.source[s_pos..e_pos])
            }
            _ if is_digit(b) => {
                Token::Number(scan_number2(scanner, s_pos))
            }
            _ if is_space(b) | is_newline(b) => {
                let e_pos = scanner.scan(is_whitespace).u8_pos;
                Token::Whitespace(&scanner.source[s_pos..e_pos])
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

pub fn is_superfluous(token: &Token) -> bool {
    matches!(token, Token::Whitespace(_))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_tokenize_multiline_comment() {
        let mut scanner = StringScanner::new("/**@a(blah:\"abba\") \n\n*/");
        assert_eq!(next_token(&mut scanner), Ok(Token::CommentStart));
        assert_eq!(next_token(&mut scanner), Ok(Token::At));
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"a")));
        assert_eq!(next_token(&mut scanner), Ok(Token::ParenOpen));
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"blah")));
        assert_eq!(next_token(&mut scanner), Ok(Token::Colon));
        assert_eq!(next_token(&mut scanner), Ok(Token::String(b"\"abba\"")));
        assert_eq!(next_token(&mut scanner), Ok(Token::ParenClose));
        assert_eq!(next_token(&mut scanner), Ok(Token::Whitespace(b" \n\n")));
        assert_eq!(next_token(&mut scanner), Ok(Token::CommentEnd));
    }
}
