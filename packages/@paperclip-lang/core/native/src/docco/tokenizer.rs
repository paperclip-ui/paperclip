use crate::base::tokenizer::next_scanner_char;
use crate::core::errors as err;
use crate::core::string_scanner::{
    is_az, is_newline, is_space, scan_string, Char, StringScanner, StringScannerError,
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
    Space(&'src [u8]),
    NewLine(&'src [u8]),
    String(&'src [u8]),
    Byte(u8),
    Cluster(&'src [u8]),
    None,
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
            b'*' => {
                if scanner.peek(0) == Some(b'/') {
                    scanner.forward(1);
                    Token::CommentEnd
                } else {
                    Token::Byte(b'*')
                }
            }
            b'/' => {
                if scanner.peek(0) == Some(b'*') {
                    scanner.forward(1);
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
            _ if is_space(b) => {
                let e_pos = scanner.scan(is_space).u8_pos;
                Token::Space(&scanner.source[s_pos..e_pos])
            }
            _ if is_newline(b) => {
                let e_pos = scanner.scan(is_newline).u8_pos;
                Token::NewLine(&scanner.source[s_pos..e_pos])
            }
            _ => Token::Byte(b),
        },
        Char::Cluster(cluster) => Token::Cluster(cluster),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_tokenize_multiline_comment() {
        let mut scanner = StringScanner::new("/*@a(blah:\"abba\") \n\n*/");
        assert_eq!(next_token(&mut scanner), Ok(Token::CommentStart));
        assert_eq!(next_token(&mut scanner), Ok(Token::At));
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"a")));
        assert_eq!(next_token(&mut scanner), Ok(Token::ParenOpen));
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"blah")));
        assert_eq!(next_token(&mut scanner), Ok(Token::Colon));
        assert_eq!(next_token(&mut scanner), Ok(Token::String(b"\"abba\"")));
        assert_eq!(next_token(&mut scanner), Ok(Token::ParenClose));
        assert_eq!(next_token(&mut scanner), Ok(Token::Space(b" ")));
        assert_eq!(next_token(&mut scanner), Ok(Token::NewLine(b"\n\n")));
        assert_eq!(next_token(&mut scanner), Ok(Token::CommentEnd));
    }
}
