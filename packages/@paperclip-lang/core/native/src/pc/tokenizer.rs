// Inspired by https://github.com/servo/rust-cssparser/blob/master/src/tokenizer.rs
use crate::base::ast::U16Position;
use crate::base::string_scanner::{
    is_az, is_digit, is_newline, is_space, scan_string, StringScanner,
};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum Token<'src> {
    None,
    CurlyOpen,
    CurlyClose,
    ParenOpen,
    ParenClose,
    SquareOpen,
    SquareClose,
    Comma,
    Colon,
    Backslack,
    Dot,
    NewLine(&'src [u8]),
    MultiLineComment(&'src [u8]),
    DoccoStart,
    Space(&'src [u8]),
    Number(&'src [u8]),
    Word(&'src [u8]),
    String(&'src [u8]),
    Byte(u8),

    // Possibly glyphs
    Cluster(&'src [u8]),
}

pub fn next_token<'src>(source: &mut StringScanner<'src>) -> Token<'src> {
    if source.is_eof() {
        return Token::None;
    }

    let s_pos = source.pos;
    let start = source.source[source.pos];
    source.forward(1);

    return match start {
        b'{' => Token::CurlyOpen,
        b'}' => Token::CurlyClose,
        b'[' => Token::SquareOpen,
        b']' => Token::SquareClose,
        b'(' => Token::ParenOpen,
        b')' => Token::ParenClose,
        b',' => Token::Comma,
        b':' => Token::Colon,
        b'/' => {
            if source.peek(0) == Some(b'*') {
                // eat *
                source.forward(1);

                // Look for /**
                if source.peek(0) == Some(b'*') {
                    source.forward(1);
                    return Token::DoccoStart;
                }

                // Eat the entire comment
                while !source.is_eof() {
                    let curr = source.source[source.pos];
                    if curr == b'*' && source.peek(1) == Some(b'/') {
                        let e_pos = source.pos + 2;
                        source.forward(2);
                        return Token::MultiLineComment(&source.source[s_pos..e_pos]);
                    }
                    source.forward(1);
                }

                // TODO - this should be more descriptive
                Token::None
            } else {
                Token::Backslack
            }
        }
        b'\"' | b'\'' => Token::String(scan_string(source, start)),
        _ if is_space(start) => {
            let e_pos = source.scan(is_space).u8_pos;
            return Token::Space(&source.source[s_pos..e_pos]);
        }
        _ if is_newline(start) => {
            let e_pos = source.scan(is_newline).u8_pos;
            return Token::NewLine(&source.source[s_pos..e_pos]);
        }
        _ if is_az(start) => {
            let e_pos = source.scan(|b| is_az(b) || is_digit(b)).u8_pos;
            return Token::Word(&source.source[s_pos..e_pos]);
        }
        b'.' => Token::Dot,
        b => Token::Byte(b),
    };
}

pub fn is_superfluous(token: &Token) -> bool {
    matches!(token, Token::Space(_) | Token::MultiLineComment(_))
}

pub fn is_superfluous_or_newline(token: &Token) -> bool {
    is_superfluous(token) || matches!(token, Token::NewLine(_))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_tokenize_multiline_comment() {
        let mut scanner = StringScanner::new("hello/*gfdfdsfsd*//**abba");
        assert_eq!(next_token(&mut scanner), Token::Word(b"hello"));
        assert_eq!(
            next_token(&mut scanner),
            Token::MultiLineComment(b"/*gfdfdsfsd*/")
        );
        assert_eq!(next_token(&mut scanner), Token::DoccoStart);
        assert_eq!(next_token(&mut scanner), Token::Word(b"abba"));
    }
}
